# 🚀 Architektur-Studie: Fischlexi goes Kubernetes (Local Proxmox Demo)

**Rolle:** Senior DevOps & Platform Engineer  
**Zielsetzung:** Autonomes lokales Deployment des *Fischlexi* Next.js Frontends auf einem K3s-Cluster unter Proxmox VE (Lenovo M920q).  
**Umgebung:** Heimnetzwerk (LAN), isoliert (kein externes Routing nötig), Datenbank verbleibt unangetastet bei Supabase.

---

## 🛠️ Phase 1: Proxmox & K3s Setup (Hardware-Planung)

Der Lenovo M920q ist ein idealer Mini-Server für Heim-Cluster, typischerweise ausgestattet mit ~6 Desktop-Cores (z.B. i5-8500T/i7) und 16 bis 32 GB RAM. Da wir rein lokales Hosting von *Fischlexi* anstreben und die Datenbank in der Cloud bleibt, ist der Ressourcenbedarf sehr genügsam.

### 1. Ressourcen-Zuteilung (Beispiel für 16GB RAM / 6 Cores)

Wir verteilen die Ressourcen auf 3 schlanke VMs (Debian 12 minimal oder Ubuntu Server):

- **k3s-master (Control-Plane)**
  - **CPU:** 2 vCores
  - **RAM:** 4 GB
  - **Disk:** 20 GB (SSD/NVMe-Backend)
  - *Zweck:* API-Server, Kine Datastore, Traefik Ingress.
- **k3s-worker-1 & k3s-worker-2**
  - **CPU:** je 2 vCores
  - **RAM:** je 4 GB
  - **Disk:** je 20 GB
  - *Zweck:* Redundante Next.js Pod-Ausführung.

---

## 📦 Phase 2: Dockerization (Next.js Standalone Build)

Damit das Docker-Image minimal bleibt (< 150 MB), nutzen wir das Next.js Feature `output: "standalone"`.

### Vorgehen für Implementation:
1. **In `next.config.ts` aktivieren:**
   ```typescript
   import type { NextConfig } from 'next';

   const nextConfig: NextConfig = {
     output: 'standalone',
     reactStrictMode: true,
     // ... weitere Konfigurationen
   };

   export default nextConfig;
   ```

2. **Das Multi-Stage Dockerfile (Konzept):**
   - **Stage 1 (deps):** `node:20-alpine` -> `npm ci`
   - **Stage 2 (builder):** Quellcode kopieren -> `npm run build` (erzeugt `.next/standalone`)
   - **Stage 3 (runner):** Minimales `node:20-alpine` Image, übernimmt nur `/public`, `/.next/static` und `/.next/standalone`. Startet via `node server.js` auf Port 3000.

---

## ☸️ Phase 3: Kubernetes Manifeste & Secrets-Sicherheit

### 1. Secrets (Sicherheit für die Cloud)
> [!IMPORTANT]
> Der `SUPABASE_SERVICE_ROLE_KEY` darf **nicht** in das öffentliche Frontend-Deployment injiziert werden! Das Frontend benötigt ausschließlich den öffentlichen Anon-Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), wodurch RLS serverseitig garantiert aktiv bleibt.

**Cluster-Secret anlegen:**
```bash
kubectl create secret generic supabase-frontend-env \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL='https://xyz.supabase.co' \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY='ey....' \
  --from-literal=NEXT_PUBLIC_APP_URL='http://fischlexi.local' \
  --from-literal=NEXT_PUBLIC_TILE_BASE_URL='http://tiles.local:3001'
```

### 2. Das Deployment (`deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fischlexi-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fischlexi
  template:
    metadata:
      labels:
        app: fischlexi
    spec:
      containers:
      - name: fischlexi-app
        image: ghcr.io/<dein-github-name>/fischlexi:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: supabase-frontend-env
        readinessProbe:
          httpGet:
            path: /de
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /de
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
```

### 3. Der Service & Ingress
```yaml
apiVersion: v1
kind: Service
metadata:
  name: fischlexi-service
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: fischlexi
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fischlexi-ingress
spec:
  rules:
  - host: fischlexi.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fischlexi-service
            port:
              number: 80
```
