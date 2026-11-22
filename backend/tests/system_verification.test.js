import http from 'http'
import app from '../src/app.js'
import pool from '../src/config/db.js'

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE SYSTEM VERIFICATION ---')
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(5094, resolve))
  const base = 'http:' + '/'.repeat(2) + 'localhost:5094/api'

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  try {
    // 1. Authentications for all roles
    const login = async (email, password) => {
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      return { status: res.status, data }
    }

    const custLogin = await login('ankit.ui.test@example.com', 'password123')
    assert(custLogin.status === 200 && custLogin.data.user.role === 'customer', 'Customer login succeeds with role "customer"')
    const custToken = custLogin.data.token

    const ownerLogin = await login('owner.test@example.com', 'password123')
    assert(ownerLogin.status === 200 && ownerLogin.data.user.role === 'owner', 'Owner login succeeds with role "owner"')
    const ownerToken = ownerLogin.data.token

    const adminLogin = await login('test@example.com', 'password123')
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login succeeds with role "admin"')
    const adminToken = adminLogin.data.token

    // 2. Wrong-role checks (middleware protection)
    const custOnOwnerRoute = await fetch(`${base}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${custToken}` }
    })
    assert(custOnOwnerRoute.status === 403, 'Customer is forbidden from owner routes (403)')

    const custOnAdminRoute = await fetch(`${base}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${custToken}` }
    })
    assert(custOnAdminRoute.status === 403, 'Customer is forbidden from admin routes (403)')

    const ownerOnAdminRoute = await fetch(`${base}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    })
    assert(ownerOnAdminRoute.status === 403, 'Owner is forbidden from admin routes (403)')

    const unauthReq = await fetch(`${base}/libraries/my`)
    assert(unauthReq.status === 401, 'Unauthenticated request to protected route is rejected (401)')

    // 3. Invalid Library submission
    const invalidSub = await fetch(`${base}/libraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ name: '' }) // missing required fields
    })
    assert(invalidSub.status === 400, 'Invalid library submission rejected with 400 Bad Request')

    // 4. Valid Library submission
    const validLibPayload = {
      name: 'Verification Hub ' + Date.now(),
      description: 'Test study space for system audit.',
      address: '100 University Ave',
      city: 'Sonipat',
      locality: 'Sector 15',
      phone: '+91 99999 88888',
      total_seats: 40,
      available_seats: 35,
      opening_hours: { general: '8:00 AM - 10:00 PM' },
      facilities: ['Wi-Fi', 'Air Conditioning', 'Power Outlets'],
      photos: ['/images/sonipat-study-space.webp']
    }

    const subRes = await fetch(`${base}/libraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify(validLibPayload)
    })
    const subData = await subRes.json()
    assert(subRes.status === 201 && subData.library.status === 'pending', 'Owner submits library; created with status "pending"')
    const testLibId = subData.library.id

    // 5. Verify library is in owner's library list
    const myLibsRes = await fetch(`${base}/libraries/my`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    })
    const myLibsData = await myLibsRes.json()
    assert(myLibsData.libraries.some((l) => l.id === testLibId), 'Newly submitted library appears in owner\'s "my libraries" list')

    // 6. Verify Customer Discover does NOT show pending library
    const discBefore = await fetch(`${base}/discovery/libraries?city=Sonipat`)
    const discBeforeData = await discBefore.json()
    assert(!discBeforeData.libraries.some((l) => l.id === testLibId), 'Customer Discover DOES NOT return pending library')

    // 7. Admin views pending submissions
    const adminPendingRes = await fetch(`${base}/libraries/admin/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    const adminPendingData = await adminPendingRes.json()
    assert(adminPendingData.libraries.some((l) => l.id === testLibId), 'Admin can view pending library in admin desk')

    // 8. Admin approves library
    const approveRes = await fetch(`${base}/libraries/admin/${testLibId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    const approveData = await approveRes.json()
    assert(approveRes.status === 200 && approveData.library.status === 'approved', 'Admin approves library; status transitions to "approved"')

    // 9. Customer Discover NOW returns approved library
    const discAfter = await fetch(`${base}/discovery/libraries?city=Sonipat`)
    const discAfterData = await discAfter.json()
    assert(discAfterData.libraries.some((l) => l.id === testLibId), 'Customer Discover NOW returns the approved library')

    // 10. Search / filter on Discover
    const discSearch = await fetch(`${base}/discovery/libraries?facility=Wi-Fi`)
    const discSearchData = await discSearch.json()
    assert(discSearchData.libraries.some((l) => l.id === testLibId), 'Discover search by facility successfully finds library')

    // 11. Customer saves the library
    const saveRes = await fetch(`${base}/saved-libraries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`
      },
      body: JSON.stringify({ library_id: testLibId })
    })
    const saveData = await saveRes.json()
    assert(saveRes.status === 201 && saveData.success, 'Customer saves the approved library')

    // 12. Customer views saved libraries
    const getSavedRes = await fetch(`${base}/saved-libraries/my`, {
      headers: { Authorization: `Bearer ${custToken}` }
    })
    const getSavedData = await getSavedRes.json()
    assert(getSavedData.libraries.some((l) => l.id === testLibId), 'Customer retrieves saved library list containing saved library')

    // 13. Customer unsaves the library
    const unsaveRes = await fetch(`${base}/saved-libraries/${testLibId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${custToken}` }
    })
    assert(unsaveRes.status === 200, 'Customer successfully removes saved library')

    // 14. Customer Dashboard endpoint verification
    const custDashRes = await fetch(`${base}/customer/dashboard`, {
      headers: { Authorization: `Bearer ${custToken}` }
    })
    const custDashData = await custDashRes.json()
    assert(custDashRes.status === 200 && custDashData.success, 'Customer dashboard aggregates metrics cleanly')

    // 15. Owner Dashboard metrics
    const ownerDashRes = await fetch(`${base}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    })
    const ownerDashData = await ownerDashRes.json()
    assert(ownerDashRes.status === 200 && ownerDashData.dashboard.statistics.libraries.approved >= 1, 'Owner dashboard aggregates approved library metrics')

    // 16. Admin Dashboard metrics
    const adminDashRes = await fetch(`${base}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    const adminDashData = await adminDashRes.json()
    assert(adminDashRes.status === 200 && adminDashData.dashboard.statistics.users.total >= 3, 'Admin dashboard returns platform-wide statistics')

    // 17. Ownership isolation test: another user cannot delete this library
    // Let's create another temporary owner to test cross-owner isolation
    const otherOwnerPass = await (await import('bcryptjs')).default.hash('password123', 10)
    const otherOwnerEmail = `other.owner.${Date.now()}@example.com`
    const insertOther = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ('Other Owner', $1, $2, 'owner') RETURNING id`,
      [otherOwnerEmail, otherOwnerPass]
    )
    const otherOwnerId = insertOther.rows[0].id
    const otherLogin = await login(otherOwnerEmail, 'password123')
    const otherToken = otherLogin.data.token

    const attemptDelete = await fetch(`${base}/libraries/${testLibId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${otherToken}` }
    })
    assert(attemptDelete.status === 404, 'Owner cannot delete or modify another owner\'s library (404/Not Found or Not Owned)')

    // Cleanup other owner
    await pool.query('DELETE FROM users WHERE id = $1', [otherOwnerId])

    // Clean up test library
    await pool.query('DELETE FROM libraries WHERE id = $1', [testLibId])
    assert(true, 'Test data cleaned up successfully')

  } catch (err) {
    console.error('Fatal test error:', err)
    failed++
  } finally {
    server.close()
  }

  console.log(`\n--- VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ---`)
  process.exit(failed === 0 ? 0 : 1)
}

runTests()
