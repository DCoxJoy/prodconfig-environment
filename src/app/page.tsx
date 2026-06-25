import { ConfiguratorProvider } from '../lib/ConfiguratorContext';
import ConfiguratorShell from '../components/configurator/ConfiguratorShell';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[560px]">
        <ConfiguratorProvider>
          <ConfiguratorShell />
        </ConfiguratorProvider>
      </div>
    </main>
  );
}
