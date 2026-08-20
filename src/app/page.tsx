import { ConfiguratorProvider } from '../lib/ConfiguratorContext';
import ConfiguratorShell from '../components/configurator/ConfiguratorShell';
import AppHeader from '../components/ui/AppHeader';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex justify-center items-start">
      <div className="w-full max-w-[720px]">
        <AppHeader />
        <div className="page-outer">
          <ConfiguratorProvider>
            <ConfiguratorShell />
          </ConfiguratorProvider>
        </div>
      </div>
    </main>
  );
}
