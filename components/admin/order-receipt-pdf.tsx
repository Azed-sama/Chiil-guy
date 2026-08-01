import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 10,
    width: 260,
  },
  center: { textAlign: 'center' },
  shopName: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  muted: { color: '#666666', fontSize: 9 },
  dashedRule: {
    borderBottomWidth: 1,
    borderBottomColor: '#999999',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  itemsHeader: { flexDirection: 'row', color: '#666666', marginBottom: 4 },
  itemsHeaderName: { flex: 1 },
  itemsHeaderQty: { width: 30, textAlign: 'center' },
  itemsHeaderTotal: { width: 60, textAlign: 'right' },
  itemRow: { flexDirection: 'row', marginBottom: 4 },
  itemName: { flex: 1 },
  itemQty: { width: 30, textAlign: 'center' },
  itemTotal: { width: 60, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 13, fontWeight: 700 },
  totalValue: { fontSize: 13, fontWeight: 700 },
  footer: { textAlign: 'center', color: '#666666', fontSize: 9, marginTop: 4 },
})

export interface ReceiptPdfProps {
  shopName: string
  shopLocation: string
  shopContact: string
  orderReference: string
  orderDateLabel: string
  customerName: string
  contactPhone: string
  shippingAddressText: string
  items: { productName: string;quantity: number;subtotal: number } []
  subtotal: number
  shippingCost: number
  totalAmount: number
  statusLabel: string
}

function formatFcfa(amount: number): string {
  const rounded = Math.round(amount)
  const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${withSpaces} FCFA`
}

export function OrderReceiptPdf(props: ReceiptPdfProps) {
  return (
    <Document>
      <Page size={{ width: 320, height: 'auto' }} style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.shopName}>{props.shopName}</Text>
          <Text style={styles.muted}>{props.shopLocation}</Text>
          <Text style={styles.muted}>{props.shopContact}</Text>
        </View>

        <View style={styles.dashedRule} />

        <View style={styles.row}>
          <Text style={styles.muted}>Reçu</Text>
          <Text>{props.orderReference}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.muted}>Date</Text>
          <Text>{props.orderDateLabel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.muted}>Client</Text>
          <Text>{props.customerName}</Text>
        </View>
        {props.contactPhone && (
          <View style={styles.row}>
            <Text style={styles.muted}>Téléphone</Text>
            <Text>{props.contactPhone}</Text>
          </View>
        )}
        {props.shippingAddressText && (
          <View style={styles.row}>
            <Text style={styles.muted}>Adresse</Text>
            <Text>{props.shippingAddressText}</Text>
          </View>
        )}

        <View style={styles.dashedRule} />

        <View style={styles.itemsHeader}>
          <Text style={styles.itemsHeaderName}>Article</Text>
          <Text style={styles.itemsHeaderQty}>Qté</Text>
          <Text style={styles.itemsHeaderTotal}>Total</Text>
        </View>
        {props.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemQty}>{item.quantity}</Text>
            <Text style={styles.itemTotal}>{formatFcfa(item.subtotal)}</Text>
          </View>
        ))}

        <View style={styles.dashedRule} />

        <View style={styles.row}>
          <Text style={styles.muted}>Sous-total</Text>
          <Text>{formatFcfa(props.subtotal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.muted}>Livraison</Text>
          <Text>{formatFcfa(props.shippingCost)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatFcfa(props.totalAmount)}</Text>
        </View>

        <View style={styles.dashedRule} />

        <View style={styles.center}>
          <Text style={styles.footer}>{props.statusLabel}</Text>
          <Text style={styles.footer}>Merci pour votre achat</Text>
        </View>
      </Page>
    </Document>
  )
}