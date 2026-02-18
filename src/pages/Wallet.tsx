import PageShell from "@/components/PageShell";
import { useApp } from "@/contexts/AppContext";
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

const transactions = [
  { id: 1, label: "Mission: Flowers + Gift Box", amount: -750, type: "debit", time: "Today, 6:15 PM" },
  { id: 2, label: "Wallet Top-up", amount: 2000, type: "credit", time: "Yesterday" },
  { id: 3, label: "Mission: Phone Charger", amount: -450, type: "debit", time: "2 days ago" },
  { id: 4, label: "Refund: Cancelled Mission", amount: 350, type: "credit", time: "3 days ago" },
];

const Wallet = () => {
  // const { walletBalance } = useApp();
  const walletBalance = 0;

  return (
    <PageShell>
      <div className="px-5 pt-6">
        {/* Balance Card */}
        <div className="bg-gradient-primary rounded-xl p-5 text-primary-foreground mb-5 shadow-glow">
          <p className="text-xs opacity-80 uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-display font-bold mt-1 flex items-center gap-1">
            <IndianRupee size={24} />{walletBalance.toLocaleString()}
          </p>
          <button className="mt-4 bg-card/20 backdrop-blur text-primary-foreground text-xs font-medium px-4 py-2 rounded-full flex items-center gap-1">
            <Plus size={14} /> Add Money
          </button>
        </div>

        {/* Transactions */}
        <h3 className="font-display font-semibold text-foreground mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 bg-card rounded-lg border border-border p-3">
              <div className={`p-2 rounded-full ${tx.type === "credit" ? "bg-success/10" : "bg-muted"}`}>
                {tx.type === "credit" ? (
                  <ArrowDownLeft size={16} className="text-success" />
                ) : (
                  <ArrowUpRight size={16} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tx.label}</p>
                <p className="text-[10px] text-muted-foreground">{tx.time}</p>
              </div>
              <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-success" : "text-foreground"}`}>
                {tx.type === "credit" ? "+" : "−"}₹{Math.abs(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Wallet;
