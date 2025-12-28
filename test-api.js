// Test script to check product creation API response
const testProduct = {
  name: "Test Product",
  sku: "TEST-001", 
  category: "Equipment",
  brand: "Test Brand",
  unitPrice: 100,
  costPrice: 50,
  stockQuantity: 10
};

console.log("Test product data:", testProduct);
console.log("Expected API endpoint: POST /api/products");
console.log("Expected response should include barcodeUrl and qrCodeUrl fields");