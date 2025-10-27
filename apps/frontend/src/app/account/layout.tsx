import Link from 'next/link';
import {
  User,
  History,
  BarChart3,
  CreditCard,
  Shield,
  FileText,
  HelpCircle,
  Trash2,
} from 'lucide-react';

const navigation = [
  {
    title: 'Account Overview',
    links: [
      { name: 'My Profile', href: '/account/profile', icon: User },
      { name: 'Prediction History', href: '/account/predictions', icon: History },
      { name: 'Usage', href: '/account/usage', icon: BarChart3 },
      { name: 'Subscription', href: '/account/subscription', icon: CreditCard },
    ],
  },
  {
    title: 'Account Management',
    links: [
      { name: 'Account Security', href: '/account/security', icon: Shield },
      { name: 'Billing History', href: '/account/billing', icon: FileText },
      { name: 'Help and Support', href: '/account/support', icon: HelpCircle },
    ],
  },
  {
    title: 'Danger Zone',
    links: [{ name: 'Delete Account', href: '/account/delete', icon: Trash2 }],
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="lg:max-w-[362px] w-full lg:mx-auto border-b border-border lg:border-b-0 lg:border-r bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

          <nav className="space-y-8">
            {navigation.map(section => (
              <div key={section.title}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{section.title}</h3>
                <ul className="space-y-1">
                  {section.links.map(link => {
                    const IconComponent = link.icon;
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <IconComponent className="h-4 w-4" />
                          {link.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
