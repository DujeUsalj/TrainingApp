# Postavljanje u produkciju

Frontend je najčešće na **Vercelu**. Backend + bazu možeš staviti na **Railway** (preporuka ako ti Render ne radi) ili **Render**.

---

## A) Railway + Vercel (ako Render ne učitava)

1. Otvori **[railway.app](https://railway.app)** → prijava **Continue with GitHub**.

2. **New project** → **Provision PostgreSQL** (ili **Database → Add PostgreSQL**).  
   Pričekaj da se baza kreira.

3. U istom projektu: **Add service** → **GitHub Repo** → odaberi **TrainingApp** (možda tražiš “Configure GitHub App” da Railway vidi repoe).

4. Klikni na **novi servis** (Node/API), zatim **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install` (ili ostavi prazno ako Railway sam detektira)
   - **Start Command**: `npm start`
   - **Watch Paths** (ako postoji): možeš ograničiti na `server/**`

5. **Variables** (Environment) na **API servisu**:
   - **`DATABASE_URL`**: u Railwayu često **povežeš** bazu ovako — otvori Postgres servis → tab **Variables** → kopiraj `DATABASE_URL` **ili** u API servisu **New Variable** → **Add Reference** → odaberi Postgres → `DATABASE_URL`.
   - **`JWT_SECRET`**: jak nasumični string (32+ znakova).
   - **`HOST`**: `0.0.0.0` (Railway i tako postavlja `PORT`).
   - **`CORS_ORIGIN`**: nakon Vercela stavi točan URL, npr. `https://tvoj-projekt.vercel.app` (ili privremeno `*` samo za test).

6. **Settings → Networking → Generate Domain** (javni HTTPS URL za API).  
   Otvori u browseru: `https://tvoj-projekt.up.railway.app/` → trebao bi JSON *Training Monitor API radi!*

7. **Shema baze** — ista kao lokalno: tablice `users`, `trainings`, itd. Pokreni SQL na Railway Postgresu (npr. **Query** tab u Railwayu ili `psql` s connection stringom).

8. **Vercel** — kao u odjeljku [3. Frontend na Vercelu](#3-frontend-na-vercelu), ali:
   - `VITE_API_BASE_URL` = **Railway URL** API-ja (bez `/` na kraju).

9. Vrati se na Railway → API **Variables** → `CORS_ORIGIN` = točan Vercel URL → **Redeploy** ako treba.

**Napomena:** Railway ponekad traži **karticu** za verifikaciju računa čak i uz besplatni kredit — to je njihova politika, ne greška u projektu.

---

## B) Render + Vercel (originalni vodič)

### 1. PostgreSQL na Renderu

1. Ulogiraj se na [render.com](https://render.com).
2. **New → PostgreSQL**.
3. Odaberi ime, region, plan (Free gdje je dostupan).
4. Nakon kreiranja otvori bazu → **Connections** → kopiraj **Internal Database URL** (ili External ako API nije na Renderu).
5. Na lokalnom računalu primijeni istu shemu tablica kao u razvoju (`users`, `trainings`, `participations`, `sensor_sessions`, `sensor_data`, `activity_results`).

   Primjer s `psql` (zamijeni URL):

   ```bash
   psql "PASTE_DATABASE_URL" -f tvoja_shema.sql
   ```

   Ili ručno izvozi iz lokalne baze (`pg_dump --schema-only` pa import).

---

### 2. Web servis (API) na Renderu

1. **New → Web Service** → poveži Git repozitorij (ili deployaj ručno).
2. Postavke:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node 20 (preporučeno)

3. **Environment** (Environment Variables):

   | Ključ | Opis |
   |--------|------|
   | `DATABASE_URL` | URL iz PostgreSQL servisa na Renderu |
   | `JWT_SECRET` | Jak nasumični string (npr. 32+ znakova) |
   | `CORS_ORIGIN` | URL Vercel frontenda, npr. `https://tvoj-projekt.vercel.app` |
   | `HOST` | `0.0.0.0` (Render postavlja `PORT` automatski) |

   SSL za Postgres: u kodu je podrazumijevano uključen SSL kad se koristi `DATABASE_URL`. Ako ti lokalni test s URL-om ne radi, vidi `DATABASE_SSL=false` u `server/.env.example`.

4. Deploy. U logu treba biti poruka da je server pokrenut. Test u pregledniku:

   `https://tvoj-servis.onrender.com/`

   Očekuješ JSON: `Training Monitor API radi!`

5. **Hibernacija (Free)**: prvi request nakon mirovanja može trajati ~30–60 s dok se servis probudi.

---

### 3. Frontend na Vercelu

1. Ulogiraj se na [vercel.com](https://vercel.com).
2. **Add New → Project** → importaj isti repo.
3. **Root Directory**: `client`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist` (Vite default)

6. **Environment Variables** (za build):

   | Ključ | Vrijednost |
   |--------|------------|
   | `VITE_API_BASE_URL` | Puni HTTPS URL API-ja, npr. `https://tvoj-servis.onrender.com` (bez završnog `/`) |

   Važno: varijabla se učitava u build vrijeme — nakon promjene uradi **Redeploy**.

7. Deploy. Otvori Vercel URL i testiraj login / treninge / vrijeme.

8. U Renderu ažuriraj `CORS_ORIGIN` na točan Vercel URL (uključujući `https://`).

---

### 4. Provjera nakon deploya

- [ ] `GET /` na API-ju vraća poruku aplikacije  
- [ ] Login s frontenda radi (nema CORS greške u konzoli)  
- [ ] Dohvat treninga radi  
- [ ] Vanjski servis vremena radi (gumb „Vrijeme”)  

---

### 5. Sigurnost (za dokumentaciju rada)

- Lozinke se spremaju hashirane (`bcrypt`).
- JWT potpisuje se tajnim ključem iz okoline (`JWT_SECRET`), ne u kodu.
- RBAC: npr. samo `COACH` / `ADMIN` kreiraju trening i mijenjaju status sudjelovanja.
- CORS je ograničen na `CORS_ORIGIN` u produkciji.

---

### 6. Alternativa: samo `render.yaml`

U rootu repozitorija postoji `render.yaml` kao polazna točka. PostgreSQL i ostale tajne varijable i dalje trebaš povezati u Render dashboardu.

---

### 7. Mobilni uređaj i HTTPS

Live senzori (`DeviceMotion`) na iOS-u često zahtijevaju **HTTPS**. Produkcijski Vercel URL je HTTPS — koristi taj URL na mobitelu, ne `http://IP:5173`.
