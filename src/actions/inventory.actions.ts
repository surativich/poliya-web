"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const cost_price = parseInt(formData.get("cost_price") as string);
  const sale_price = parseInt(formData.get("sale_price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 5;

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert([{
      name,
      category,
      cost_price,
      sale_price,
      stock_quantity,
      min_stock
    }])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (newProduct) {
    await supabase.from("inventory_movements").insert([{
      product_id: newProduct.id,
      previous_stock: 0,
      change_amount: stock_quantity,
      new_stock: stock_quantity,
      type: 'IN',
      reason: 'Yangi mahsulot qo\'shildi'
    }]);
  }

  revalidatePath('/inventory');
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const cost_price = parseInt(formData.get("cost_price") as string);
  const sale_price = parseInt(formData.get("sale_price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 5;

  // get old product to check stock change
  const { data: oldProduct } = await supabase.from('products').select('stock_quantity').eq('id', id).single();

  const { error } = await supabase
    .from('products')
    .update({
      name,
      category,
      cost_price,
      sale_price,
      stock_quantity,
      min_stock
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (oldProduct && oldProduct.stock_quantity !== stock_quantity) {
    const diff = stock_quantity - oldProduct.stock_quantity;
    await supabase.from("inventory_movements").insert([{
      product_id: id,
      previous_stock: oldProduct.stock_quantity,
      change_amount: diff,
      new_stock: stock_quantity,
      type: diff > 0 ? 'IN' : 'ADJUST',
      reason: 'Qoldiq tahrirlandi'
    }]);
  }

  revalidatePath('/inventory');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/inventory');
  return { success: true };
}

export async function addProductsBulk(products: any[]) {
  // Filter valid products and map to DB columns
  const validProducts = products.map(p => ({
    name: p.name,
    category: p.category || "Umumiy",
    cost_price: p.cost_price || 0,
    sale_price: p.sale_price || 0,
    stock_quantity: p.stock_quantity || 0,
    min_stock: p.min_stock || 5
  })).filter(p => p.name);

  if (validProducts.length === 0) {
    return { success: false, error: "Yaroqli mahsulotlar topilmadi!" };
  }

  const { error } = await supabase.from("products").insert(validProducts);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventory");
  return { success: true };
}


import * as xlsx from "xlsx";

export async function uploadExcelFile(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "Fayl topilmadi!" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const data: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const validProducts = data.map((p) => ({
    name: p["Nomi"] || p["name"] || p["Name"],
    category: p["Kategoriya"] || p["category"] || p["Category"] || "Umumiy",
    cost_price: parseInt(p["Kelish narxi"] || p["cost_price"] || p["Cost Price"]) || 0,
    sale_price: parseInt(p["Sotish narxi"] || p["sale_price"] || p["Sale Price"]) || 0,
    stock_quantity: parseInt(p["Soni"] || p["stock_quantity"] || p["Quantity"]) || 0,
    min_stock: parseInt(p["Min qoldiq"] || p["min_stock"] || p["Min Stock"]) || 5
  })).filter(p => p.name);

  if (validProducts.length === 0) {
    return { success: false, error: "Excel faylida yaroqli mahsulotlar topilmadi!" };
  }

  const { error } = await supabase.from("products").insert(validProducts);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/inventory");
  return { success: true };
}

