import fetch from 'node-fetch';

async function test() {
  console.log("Registering user...");
  let res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      role: 'seeker'
    })
  });
  
  if (res.status === 400) {
    console.log("User might exist, trying to login...");
    res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123'
      })
    });
  }

  const data = await res.json();
  console.log("Auth Data:", data);

  if (!data.token) {
    console.log("No token, exiting.");
    return;
  }

  console.log("Fetching dashboard...");
  const dashRes = await fetch('http://localhost:5000/api/jobseeker/dashboard', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
  
  const dashData = await dashRes.json();
  console.log("Dashboard Status:", dashRes.status);
  console.log("Dashboard Data:", dashData);

  console.log("Fetching profile...");
  const profRes = await fetch('http://localhost:5000/api/profile', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
  
  const profData = await profRes.json();
  console.log("Profile Status:", profRes.status);
  console.log("Profile Data:", profData);
}

test();
