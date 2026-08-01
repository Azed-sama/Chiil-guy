import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getOrderById } from '@/lib/data/admin/orders'
import { getSiteSettings } from '@/lib/data/settings'
import { getCurrentUser } from '@/lib/data/auth'
import { OrderReceiptPdf } from '@/components/admin/order-receipt-pdf'
import { ORDER_STATUS_LABELS } from '@/lib/constants/order-status'

function orderReference(id: string) {
  return `CMD-${id.slice(0, 8).toUpperCase()}`
}

function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { isAdmin } = await getCurrentUser()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  
  const order = await getOrderById(params.id)
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }
  
  const overrides = (await request.json().catch(() => ({}))) as {
    customerName ? : string
    contactPhone ? : string
    shippingAddressText ? : string
  }
  
  const settings = await getSiteSettings()
  
  const pdfBuffer = await renderToBuffer(
    OrderReceiptPdf({
      shopName: settings.storeName,
      shopLocation: settings.storeDescription,
      shopContact: settings.whatsappNumber ? `WhatsApp ${settings.whatsappNumber}` : '',
      orderReference: orderReference(order.id),
      orderDateLabel: formatOrderDate(order.createdAt),
      customerName: overrides.customerName || order.customerName,
      contactPhone: overrides.contactPhone || order.contactPhone || '',
      shippingAddressText: overrides.shippingAddressText || '',
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
    })
  )
  
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-${order.id.slice(0, 8)}.pdf"`,
    },
  })
}