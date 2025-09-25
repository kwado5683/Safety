/*
DESCRIPTION: API route that generates and returns a PDF report for a specific inspection.
- Fetches inspection data, responses, and checklist from the database
- Renders a professional PDF report using @react-pdf/renderer
- Includes summary table, failed items, and auto-generated actions
- Returns the PDF as a downloadable file with proper headers
- Protected by authentication (requires login)

WHAT EACH PART DOES:
1. getAuth() - Gets the current authenticated user from Clerk
2. createAdminClient - Server-side Supabase client for database operations
3. GET handler - Fetches inspection data, generates PDF, returns as response
4. PDF generation - Uses React PDF components to create professional report
5. Error handling - Returns appropriate error responses

PSEUDOCODE:
- Check if user is authenticated
- Get inspection ID from URL parameters
- Fetch inspection data from database
- Fetch inspection responses and checklist items
- Generate PDF using React PDF components
- Return PDF as downloadable response
*/

import { getAuth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer'

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2 solid #3b82f6',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    width: 120,
  },
  value: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  summaryTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #f3f4f6',
    alignItems: 'flex-start',
  },
  tableCell: {
    fontSize: 9,
    paddingRight: 4,
    textAlign: 'left',
    lineHeight: 1.2,
    flexWrap: 'wrap',
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    paddingRight: 4,
    textAlign: 'left',
    lineHeight: 1.2,
  },
  statusPass: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  statusFail: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statusNa: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  criticalBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
})

// Function to format date
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Function to get status color
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pass':
      return styles.statusPass
    case 'fail':
      return styles.statusFail
    case 'na':
      return styles.statusNa
    default:
      return styles.statusNa
  }
}

export async function GET(request, { params }) {
  try {
    // Check authentication
    const { userId } = await getAuth(request)
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inspectionId } = await params

    if (!inspectionId) {
      return Response.json({ error: 'Inspection ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch inspection data with checklist
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id,
        checklist_id,
        inspector_id,
        started_at,
        submitted_at,
        checklists (
          id,
          name,
          category
        )
      `)
      .eq('id', inspectionId)
      .single()

    if (inspectionError || !inspection) {
      console.error('Error fetching inspection:', inspectionError)
      return Response.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Fetch inspection responses with checklist items
    const { data: responses, error: responsesError } = await supabase
      .from('inspection_responses')
      .select(`
        id,
        item_id,
        result,
        note,
        photos,
        checklist_items (
          id,
          text,
          critical
        )
      `)
      .eq('inspection_id', inspectionId)

    if (responsesError) {
      console.error('Error fetching inspection responses:', responsesError)
      return Response.json({ error: 'Failed to fetch inspection responses' }, { status: 500 })
    }

    // Calculate summary statistics
    const totalItems = responses.length
    const passCount = responses.filter(r => r.result === 'pass').length
    const failCount = responses.filter(r => r.result === 'fail').length
    const naCount = responses.filter(r => r.result === 'na').length
    const criticalFails = responses.filter(r => r.result === 'fail' && r.checklist_items?.critical).length

    // Get failed items for detailed report
    const failedItems = responses.filter(r => r.result === 'fail')

    // Create PDF document
    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Safety Management System</Text>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>
              Report Generated: {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Report Title */}
          <Text style={styles.reportTitle}>Inspection Report</Text>

          {/* Inspection Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Information</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Inspection ID:</Text>
              <Text style={styles.value}>INS-{inspection.id}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Checklist:</Text>
              <Text style={styles.value}>{inspection.checklists?.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{inspection.checklists?.category || 'N/A'}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Inspector ID:</Text>
              <Text style={styles.value}>{inspection.inspector_id}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Started At:</Text>
              <Text style={styles.value}>{formatDate(inspection.started_at)}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Submitted At:</Text>
              <Text style={styles.value}>{formatDate(inspection.submitted_at)}</Text>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Summary</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Total Items:</Text>
              <Text style={styles.value}>{totalItems}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Passed:</Text>
              <Text style={[styles.value, styles.statusPass]}>{passCount}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Failed:</Text>
              <Text style={[styles.value, styles.statusFail]}>{failCount}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Not Applicable:</Text>
              <Text style={[styles.value, styles.statusNa]}>{naCount}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Critical Fails:</Text>
              <Text style={[styles.value, styles.statusFail]}>{criticalFails}</Text>
            </View>
          </View>

          {/* Summary Table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Results</Text>
            
            <View style={styles.summaryTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: '5%' }]}>#</Text>
                <Text style={[styles.headerCell, { width: '50%' }]}>Item</Text>
                <Text style={[styles.headerCell, { width: '10%' }]}>Result</Text>
                <Text style={[styles.headerCell, { width: '15%' }]}>Critical</Text>
                <Text style={[styles.headerCell, { width: '20%' }]}>Notes</Text>
              </View>
              
              {/* Table Rows */}
              {responses.map((response, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '5%' }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: '50%' }]}>
                    {response.checklist_items?.text || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { width: '10%' }, getStatusColor(response.result)]}>
                    {response.result?.toUpperCase() || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>
                    {response.checklist_items?.critical ? (
                      <Text style={styles.criticalBadge}>CRITICAL</Text>
                    ) : 'No'}
                  </Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>
                    {response.note || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Failed Items Section */}
          {failedItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Failed Items ({failedItems.length})</Text>
              
              {failedItems.map((item, index) => (
                <View key={index} style={{ marginBottom: 15, padding: 10, backgroundColor: '#fef2f2', borderRadius: 4 }}>
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: '#dc2626' }]}>Item:</Text>
                    <Text style={[styles.value, { color: '#dc2626' }]}>
                      {item.checklist_items?.text || 'N/A'}
                    </Text>
                  </View>
                  
                  {item.checklist_items?.critical && (
                    <View style={styles.row}>
                      <Text style={[styles.label, { color: '#dc2626' }]}>Status:</Text>
                      <Text style={[styles.value, styles.criticalBadge]}>CRITICAL FAILURE</Text>
                    </View>
                  )}
                  
                  {item.note && (
                    <View style={styles.row}>
                      <Text style={[styles.label, { color: '#dc2626' }]}>Notes:</Text>
                      <Text style={[styles.value, { color: '#dc2626' }]}>{item.note}</Text>
                    </View>
                  )}
                  
                  {item.photos && item.photos.length > 0 && (
                    <View style={styles.row}>
                      <Text style={[styles.label, { color: '#dc2626' }]}>Photos:</Text>
                      <Text style={[styles.value, { color: '#dc2626' }]}>
                        {item.photos.length} photo(s) attached
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Auto-Generated Actions Note */}
          {criticalFails > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Auto-Generated Actions</Text>
              <View style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                <Text style={{ fontSize: 12, color: '#92400e', lineHeight: 1.4 }}>
                  {criticalFails} critical failure(s) detected. Incident actions have been automatically created 
                  and assigned to appropriate personnel for immediate corrective action.
                </Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            This report was generated by the Safety Management System on {new Date().toLocaleDateString()}
          </Text>
        </Page>
      </Document>
    )

    // Generate PDF
    const pdfBuffer = await pdf(MyDocument()).toBuffer()

    // Return PDF response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection-report-${inspectionId}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return Response.json({ error: 'Failed to generate PDF report' }, { status: 500 })
  }
}
