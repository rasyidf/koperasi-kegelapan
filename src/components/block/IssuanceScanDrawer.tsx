import { Wifi, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import type { CardPayload } from '../../core/payload/types'
import { CardState, CardStatus } from '../../core/payload/types'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

interface IssuanceScanDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phase: 'idle' | 'scanning' | 'writing' | 'done' | 'error'
  mode: 'read' | 'write'
  payload: CardPayload | null
  serialNumber: string | null
  error: string | null
  onClose: () => void
  onRetry: () => void
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(':')
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right break-all font-mono">{value}</span>
    </div>
  )
}

export function IssuanceScanDrawer({
  open,
  onOpenChange,
  phase,
  mode,
  payload,
  serialNumber,
  error,
  onClose,
  onRetry,
}: IssuanceScanDrawerProps) {
  const isScanning = phase === 'scanning'
  const isWriting = phase === 'writing'
  const isBusy = isScanning || isWriting
  const isDone = phase === 'done'
  const isError = phase === 'error'

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isScanning && 'Scan Kartu NFC'}
            {isWriting && 'Tulis Kartu NFC'}
            {isDone && (payload?.identity.name ?? 'Kartu')}
            {isError && 'Gagal'}
          </DrawerTitle>
          {isScanning && (
            <DrawerDescription>Dekatkan kartu NFC ke perangkat</DrawerDescription>
          )}
          {isWriting && (
            <DrawerDescription>Menulis data ke kartu NFC...</DrawerDescription>
          )}
          {isDone && payload && (
            <DrawerDescription>
              <Badge variant="secondary">{CardStatus[payload.identity.status] ?? String(payload.identity.status)}</Badge>
            </DrawerDescription>
          )}
        </DrawerHeader>

        <div className="px-4 overflow-y-auto max-h-[60vh]">
          {/* Scanning state */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-8 gap-6">
              <div className="relative flex items-center justify-center w-40 h-40">
                <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <span className="absolute inset-4 rounded-full border-2 border-primary/30 animate-ping [animation-delay:300ms]" />
                <span className="absolute inset-8 rounded-full border-2 border-primary/40 animate-ping [animation-delay:600ms]" />
                <span className="relative z-10 w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                  <Wifi size={40} className="text-primary animate-pulse" />
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">Tap kartu...</p>
            </div>
          )}

          {/* Writing state */}
          {isWriting && (
            <div className="flex flex-col items-center justify-center py-8 gap-6">
              <div className="relative flex items-center justify-center w-40 h-40">
                <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <span className="absolute inset-4 rounded-full border-2 border-primary/30 animate-ping [animation-delay:300ms]" />
                <span className="absolute inset-8 rounded-full border-2 border-primary/40 animate-ping [animation-delay:600ms]" />
                <span className="relative z-10 w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                  <Loader2 size={40} className="text-primary animate-spin" />
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">Menulis kartu...</p>
            </div>
          )}

          {/* Done state */}
          {isDone && payload && (
            <div className="space-y-4 py-2">
              {/* Summary card */}
              <div className="rounded-xl bg-muted/40 border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{payload.identity.name}</span>
                  <Badge variant="outline">{CardState[payload.wallet.state] ?? String(payload.wallet.state)}</Badge>
                </div>
                <p className="text-2xl font-bold">{formatRupiah(payload.wallet.balance)}</p>
                <p className="text-xs text-muted-foreground">Counter: {String(payload.wallet.counter)}</p>
              </div>

              {mode === 'write' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  <span>Round-trip verified</span>
                </div>
              )}

              <Separator />

              {/* Detailed info */}
              <div className="rounded-md border bg-muted/40 p-3 space-y-1">
                {serialNumber && <InfoRow label="Serial number" value={serialNumber} />}
                <InfoRow label="Card ID" value={toHex(payload.header.cardId)} />
                <InfoRow label="Version" value={String(payload.header.version)} />
                <InfoRow label="User ID" value={String(payload.identity.userId)} />
                <InfoRow label="Dibuat" value={new Date(payload.identity.createdAt * 1000).toLocaleString('id-ID')} />
                <Separator className="my-1" />
                <InfoRow label="Berlaku s/d" value={new Date(payload.trailer.expiresAt * 1000).toLocaleString('id-ID')} />
                <InfoRow label="Key version" value={String(payload.trailer.keyVersion)} />
                <InfoRow label="Active ptr" value={String(payload.trailer.activePtr)} />
                <InfoRow label="Counter bind" value={String(payload.trailer.counterBind)} />
                <InfoRow label="HMAC" value={toHex(payload.trailer.hmac)} />
                <InfoRow label="Root hash" value={toHex(payload.trailer.rootHash)} />
                {payload.logEntries.length > 0 && (
                  <>
                    <Separator className="my-1" />
                    <p className="text-xs text-muted-foreground">Log ({payload.logEntries.length} entri)</p>
                    {payload.logEntries.map((e, i) => (
                      <div key={i} className="pl-2 border-l space-y-0.5">
                        <InfoRow label={`[${i}] amount`} value={String(e.amount)} />
                        <InfoRow label={`[${i}] balance`} value={String(e.balanceAfter)} />
                        <InfoRow label={`[${i}] flags`} value={`0x${e.flags.toString(16)}`} />
                        <InfoRow label={`[${i}] hash`} value={toHex(e.hash)} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center">
                <XCircle size={48} className="text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-bold text-destructive">Gagal</p>
                {error && <p className="text-sm text-muted-foreground mt-1">{error}</p>}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          {isBusy && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Batal
            </Button>
          )}
          {isDone && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Tutup
            </Button>
          )}
          {isError && (
            <>
              <Button onClick={onRetry} className="w-full">
                Coba Lagi
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Tutup
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
