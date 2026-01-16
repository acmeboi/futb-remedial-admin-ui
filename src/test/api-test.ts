/**
 * API Integration Test Script
 * Run this to test all API endpoints
 */

import { API_BASE_URL } from '../lib/constants';

const ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njg0NjExMDIsImV4cCI6MTc2ODQ2NDcwMiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoiaXNhbXVoYW1tYWQwMTMxQGdtYWlsLmNvbSJ9.KNnxqRiBEXYaJglz-IQpmTHwgRIwG7V0p_37B_gB7gvAx52AxGQ01zgDvbHDSbt81LEM2Ukn-qkeXO0V5FayrYhuUJo5coKh7-_5W-uG2Prn4qBJFMrKM3ZOavjgMrFrhFKQw7RYkEgtRx3RlcMzjZfLH3Hr8GMXQ-h_26-GThLI7Ty0-N4RAY9DWrQHDf38i15LG86OMcI532PvEQCBdFVPR9QcNEualyw-AOhUu03peUflhUSyASMTRQ4J6rY8wImmrZlIHzRAaWTFZDRpSm9mu9J3KgSGdJ9fMfnkbXeCN0jcqJCLsbfI3pegI4xdsMxoqpMf2nsd2FVkoLSvgw";

const endpoints = [
  { method: 'GET', path: '/applicants', name: 'List Applicants' },
  { method: 'GET', path: '/applications', name: 'List Applications' },
  { method: 'GET', path: '/payments', name: 'List Payments' },
  { method: 'GET', path: '/users', name: 'List Users' },
  { method: 'GET', path: '/states', name: 'List States' },
  { method: 'GET', path: '/lgas', name: 'List LGAs' },
  { method: 'GET', path: '/programs', name: 'List Programs' },
  { method: 'GET', path: '/document_types', name: 'List Document Types' },
  { method: 'GET', path: '/application_documents', name: 'List Documents' },
];

async function testEndpoint(method: string, path: string, name: string) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Accept': 'application/ld+json',
        'Content-Type': 'application/ld+json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      if (data['hydra:member']) {
        console.log(`   Found ${data['hydra:totalItems'] || data['hydra:member'].length} items`);
      }
      return true;
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   ${error.message}`);
    return false;
  }
}

export async function testAllEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  console.log(`Base URL: ${API_BASE_URL}\n`);
  
  const results = await Promise.all(
    endpoints.map(ep => testEndpoint(ep.method, ep.path, ep.name))
  );
  
  const successCount = results.filter(r => r).length;
  console.log(`\n📊 Results: ${successCount}/${endpoints.length} endpoints working`);
  
  return results.every(r => r);
}

// Run if executed directly
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAllEndpoints;
  console.log('API test function available at window.testAPI()');
}

