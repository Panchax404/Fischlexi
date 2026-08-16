import MapWrapper from '../../../../components/MapWrapper';

export default function KartePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent w-fit">
          Interaktive Karte
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Erkunde die natürliche Herkunft unserer Fische auf der Weltkarte.
        </p>
      </div>
      
      <div className="flex-1 w-full relative">
        {/* Die Karte nimmt den restlichen verfügbaren Platz ein */}
        <MapWrapper />
      </div>
    </div>
  );
}
