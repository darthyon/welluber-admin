import { X, MapPin, Users, Wallet } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BranchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
}

export function BranchSheet({ isOpen, onClose, branchName }: BranchSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over sheet */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-[150] w-full sm:w-3/4 max-w-2xl bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {branchName || "Add New Branch"}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Configure branch details, PICs, and wallet.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            
            {/* Branch Details Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <MapPin size={16} className="text-muted-foreground" />
                <h3 className="text-[14px] font-semibold text-foreground">Location Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">Branch Name</label>
                  <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none focus:border-foreground/30 focus:bg-muted/30" placeholder="e.g. ACME Subang Jaya" defaultValue={branchName} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Branch Type</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none">
                    <option>Headquarters (HQ)</option>
                    <option>Branch Office</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Timezone</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none">
                    <option>Asia/Kuala_Lumpur (GMT+8)</option>
                    <option>Asia/Singapore (GMT+8)</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-foreground">Address Line</label>
                  <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none focus:border-foreground/30 focus:bg-muted/30" placeholder="123 Example Street" />
                </div>
              </div>
            </section>

            {/* PICs Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Users size={16} className="text-muted-foreground" />
                <h3 className="text-[14px] font-semibold text-foreground">Primary Contacts (PIC)</h3>
              </div>
              <div className="border border-border/50 rounded-lg p-4 bg-muted/20 text-center">
                <p className="text-[13px] text-muted-foreground mb-3">No contacts mapped to this branch yet.</p>
                <Button variant="outline" size="sm" className="text-[12px] h-8">
                  + Add Contact
                </Button>
              </div>
            </section>

            {/* Wallet Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Wallet size={16} className="text-muted-foreground" />
                <h3 className="text-[14px] font-semibold text-foreground">Branch Wallet</h3>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-5">
                {branchName ? (
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-[13px] text-muted-foreground font-medium mb-1">Available Balance</p>
                       <p className="text-3xl font-semibold tracking-tight text-foreground">RM 50,000.00</p>
                     </div>
                     <Button size="sm" className="text-[13px] h-9">
                       Top Up Fund
                     </Button>
                   </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[13px] text-muted-foreground">Select a wallet model to activate funding for this branch.</p>
                    <select className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none">
                      <option>Cash Balance (Pre-funded)</option>
                      <option>Credit Limit (Post-paid)</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
         <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3">
          <Button 
            variant="ghost"
            onClick={onClose}
            className="text-[13px] font-medium h-9"
          >
            Cancel
          </Button>
          <Button className="px-5 text-[13px] font-medium h-9">
            {branchName ? "Save Changes" : "Create Branch"}
          </Button>
        </div>
      </div>
    </>
  );
}
