import { ConfiguratorProvider } from '../lib/ConfiguratorContext';
import ConfiguratorShell from '../components/configurator/ConfiguratorShell';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex justify-center items-start">
      <div className="w-full max-w-[720px] page-outer">
        <ConfiguratorProvider>
          <ConfiguratorShell />
        </ConfiguratorProvider>
      </div>
    </main>
  );
}
