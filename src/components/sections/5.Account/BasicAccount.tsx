import { SectionProps } from '@/types/wedding';

// Define the interface for an account
interface Account {
  bank: string;
  account: string;
  name: string;
}

export default function BasicAccount({ config, isVisible }: SectionProps) {
  if (!isVisible) return null;
  
  // Assuming config has banks array: [{ bank: 'Shinhan', account: '110...', name: 'Hong Gil Dong' }]
  const accounts = (config.accounts as Account[]) || [];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <h3 className="text-center font-serif text-xl mb-8">마음 전하실 곳</h3>
      <div className="space-y-4 max-w-sm mx-auto">
        {accounts.map((acc, idx) => (
          <div key={idx} className="bg-[#fffdf7] p-4 rounded-lg shadow-sm flexjustify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{acc.bank} (예금주: {acc.name})</p>
              <p className="text-md font-mono mt-1 text-gray-700">{acc.account}</p>
            </div>
            {/* Copy button logic could be added here */}
          </div>
        ))}
      </div>
    </section>
  );
}
