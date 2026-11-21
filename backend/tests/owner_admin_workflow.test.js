import pool from '../src/config/db.js'
import bcrypt from 'bcryptjs'

const API_BASE = 'http://localhost:5001/api'

async function runTests() {
  console.log('--- Starting Owner & Admin Workflow Verification ---')

  // 1. Admin Login
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  })
  const adminLoginData = await adminLoginRes.json()
  if (!adminLoginRes.ok || !adminLoginData.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`)
  }
  const adminToken = adminLoginData.token
  console.log('✅ 1. Admin login successful')

  // 2. Admin calls Admin Dashboard, Applications, and Pending Libraries (All should succeed)
  const [adminDashRes, adminAppsRes, adminLibsRes] = await Promise.all([
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }),
    fetch(`${API_BASE}/owners/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }),
    fetch(`${API_BASE}/libraries/admin/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
  ])

  if (!adminDashRes.ok || !adminAppsRes.ok || !adminLibsRes.ok) {
    throw new Error('Admin API access verification failed')
  }
  console.log('✅ 2. Admin APIs (dashboard, applications, pending libraries) respond 200 OK')

  // 3. Apply as Owner workflow
  const testEmail = `test.applicant.${Date.now()}@example.com`
  const applyRes = await fetch(`${API_BASE}/owners/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: testEmail,
      password: 'password123',
      libraryName: 'Priya Reading Room & Study Hub',
      libraryAddress: 'Shop 12, Sector 15 Market, Sonipat',
      phone: '+91 98123 45678'
    })
  })
  const applyData = await applyRes.json()
  if (!applyRes.ok || !applyData.application?.id) {
    throw new Error(`Owner application failed: ${JSON.stringify(applyData)}`)
  }
  const applicationId = applyData.application.id
  console.log(`✅ 3. Owner application created successfully (ID: ${applicationId}, Status: ${applyData.application.status})`)

  // 4. Verify Applicant is NOT yet in users table
  const userCheckRes = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail])
  if (userCheckRes.rows.length !== 0) {
    throw new Error('Applicant should NOT have an active user account before admin approval!')
  }
  console.log('✅ 4. Verified applicant cannot access platform before approval (no user record exists)')

  // 5. Admin lists applications and finds the new application
  const listAppsRes = await fetch(`${API_BASE}/owners/applications`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  const listAppsData = await listAppsRes.json()
  const foundApp = listAppsData.applications.find((a) => a.id === applicationId)
  if (!foundApp || foundApp.status !== 'pending') {
    throw new Error('Submitted application not visible in admin applications list')
  }
  console.log('✅ 5. Admin successfully lists and inspects pending owner application')

  // 6. Admin approves owner application
  const approveAppRes = await fetch(`${API_BASE}/owners/applications/${applicationId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  const approveAppData = await approveAppRes.json()
  if (!approveAppRes.ok || !approveAppData.owner?.id) {
    throw new Error(`Admin application approval failed: ${JSON.stringify(approveAppData)}`)
  }
  console.log(`✅ 6. Admin approved owner application. User created with role: ${approveAppData.owner.role}`)

  // 7. Newly approved owner logs in
  const ownerLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  })
  const ownerLoginData = await ownerLoginRes.json()
  if (!ownerLoginRes.ok || !ownerLoginData.token || ownerLoginData.user.role !== 'owner') {
    throw new Error(`Approved owner login failed: ${JSON.stringify(ownerLoginData)}`)
  }
  const ownerToken = ownerLoginData.token
  console.log('✅ 7. Newly approved owner logs in successfully with role "owner"')

  // 8. New owner lists libraries (should start empty)
  const myLibsRes = await fetch(`${API_BASE}/libraries/my`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  })
  const myLibsData = await myLibsRes.json()
  if (!myLibsRes.ok || !Array.isArray(myLibsData.libraries)) {
    throw new Error('Owner getMyLibraries failed')
  }
  console.log(`✅ 8. Owner accesses /api/libraries/my (found ${myLibsData.libraries.length} libraries)`)

  // 9. New owner submits a library
  const createLibRes = await fetch(`${API_BASE}/libraries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerToken}`
    },
    body: JSON.stringify({
      name: 'Priya Reading Space',
      description: 'Peaceful air-conditioned study rooms with high-speed internet.',
      address: 'Shop 12, Sector 15 Market',
      city: 'Sonipat',
      locality: 'Sector 15',
      phone: '+91 98123 45678',
      total_seats: 40,
      available_seats: 40,
      opening_hours: { general: 'Mon - Sun: 7:00 AM - 11:00 PM' },
      facilities: ['Wi-Fi', 'Air Conditioning', 'Power Outlets', 'Silent Zone'],
      photos: ['/images/sonipat-study-space.webp']
    })
  })
  const createLibData = await createLibRes.json()
  if (!createLibRes.ok || !createLibData.library?.id) {
    throw new Error(`Library submission failed: ${JSON.stringify(createLibData)}`)
  }
  const newLibId = createLibData.library.id
  if (createLibData.library.status !== 'pending') {
    throw new Error(`New library should have status pending, got: ${createLibData.library.status}`)
  }
  console.log(`✅ 9. Owner submitted library (ID: ${newLibId}, status: ${createLibData.library.status})`)

  // 10. Verify library is NOT in Customer Discover
  const discoverPreRes = await fetch(`${API_BASE}/discovery/libraries`)
  const discoverPreData = await discoverPreRes.json()
  const inDiscoverPre = discoverPreData.libraries?.some((l) => l.id === newLibId)
  if (inDiscoverPre) {
    throw new Error('Pending library must NOT be visible on Customer Discover before approval!')
  }
  console.log('✅ 10. Customer Discover does NOT show pending library')

  // 11. Admin sees pending library in /libraries/admin/pending
  const pendingLibsRes = await fetch(`${API_BASE}/libraries/admin/pending`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  const pendingLibsData = await pendingLibsRes.json()
  const foundPendingLib = pendingLibsData.libraries?.find((l) => l.id === newLibId)
  if (!foundPendingLib) {
    throw new Error('Submitted library not found in Admin pending libraries')
  }
  console.log('✅ 11. Admin finds submitted library in /libraries/admin/pending')

  // 12. Admin approves library
  const approveLibRes = await fetch(`${API_BASE}/libraries/admin/${newLibId}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  const approveLibData = await approveLibRes.json()
  if (!approveLibRes.ok) {
    throw new Error(`Admin library approval failed: ${JSON.stringify(approveLibData)}`)
  }
  console.log('✅ 12. Admin approves library listing')

  // 13. Verify library IS now visible in Customer Discover
  const discoverPostRes = await fetch(`${API_BASE}/discovery/libraries`)
  const discoverPostData = await discoverPostRes.json()
  const inDiscoverPost = discoverPostData.libraries?.some((l) => l.id === newLibId)
  if (!inDiscoverPost) {
    throw new Error('Approved library MUST be visible on Customer Discover!')
  }
  console.log('✅ 13. Approved library is live on Customer Discover')

  // 14. Test Reject Application flow
  const rejectTestEmail = `reject.applicant.${Date.now()}@example.com`
  const rejectApplyRes = await fetch(`${API_BASE}/owners/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rajesh Verma',
      email: rejectTestEmail,
      password: 'password123',
      libraryName: 'Rajesh Invalid Space',
      libraryAddress: 'Unknown Street',
      phone: '+91 99999 88888'
    })
  })
  const rejectApplyData = await rejectApplyRes.json()
  const rejectAppId = rejectApplyData.application.id

  const rejectRes = await fetch(`${API_BASE}/owners/applications/${rejectAppId}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` }
  })
  const rejectData = await rejectRes.json()
  if (!rejectRes.ok || rejectData.application.status !== 'rejected') {
    throw new Error(`Application rejection failed: ${JSON.stringify(rejectData)}`)
  }

  // Attempt login with rejected applicant
  const rejectLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: rejectTestEmail, password: 'password123' })
  })
  if (rejectLoginRes.status !== 401 && rejectLoginRes.status !== 404) {
    throw new Error('Rejected applicant should not be able to log in!')
  }
  console.log('✅ 14. Rejected applicant correctly barred from platform access')

  console.log('\n🎉 ALL 14 OWNER & ADMIN WORKFLOW TESTS PASSED PERFECTLY!')
  process.exit(0)
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err.message)
  process.exit(1)
})
