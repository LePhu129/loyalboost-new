import axios from 'axios';

async function testBarcodeScanning() {
  try {
    const testData = {
      barcode: '957066401909', // Our test customer's barcode
      amount: 100 // Points to add
    };

    console.log('Sending request with data:', testData);
    const response = await axios.post('http://localhost:5000/api/points/barcode', testData);
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testBarcodeScanning(); 