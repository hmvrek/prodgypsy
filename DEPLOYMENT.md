# 🚀 GypsyCFG - Kompletny Poradnik Deploymentu

## Informacje o projekcie
- **IP serwera Oracle Cloud:** `92.5.94.220`
- **Domena:** `prodgypsy.xyz` / `www.prodgypsy.xyz`

---

## KROK 1: Stwórz darmowy projekt Supabase

1. Wejdź na **https://supabase.com** i załóż konto (za darmo)
2. Kliknij **"New project"**
3. Wybierz nazwę np. `gypsycfg` i region najbliżej (np. Frankfurt)
4. Ustaw hasło do bazy danych (zapisz je!)
5. Poczekaj aż projekt się stworzy (~2 minuty)

### Pobierz klucze API:
1. W dashboardzie Supabase wejdź w **Settings → API**
2. Skopiuj:
   - **Project URL** — np. `https://abcdefgh.supabase.co`
   - **anon public key** — długi klucz zaczynający się od `eyJ...`

### Stwórz tabelę w bazie:
1. W Supabase wejdź w **SQL Editor**
2. Kliknij **"New query"**
3. Wklej **całą zawartość** pliku `supabase-schema.sql` z tego projektu
4. Kliknij **"Run"**
5. Powinieneś zobaczyć "Success" — tabela `links` jest stworzona!

---

## KROK 2: Skonfiguruj DNS domeny

W panelu swojego registrara domeny (gdzie kupiłeś `prodgypsy.xyz`), ustaw:

| Typ | Nazwa | Wartość | TTL |
|-----|-------|---------|-----|
| A | @ | 92.5.94.220 | 300 |
| A | www | 92.5.94.220 | 300 |

⏳ DNS może potrzebować do 24h na propagację, ale zwykle działa w 5-30 minut.

Możesz sprawdzić czy DNS działa: https://dnschecker.org/#A/prodgypsy.xyz

---

## KROK 3: Przygotuj serwer Oracle Cloud

Zaloguj się na serwer:
```bash
ssh ubuntu@92.5.94.220
```

### 3a. Otwórz porty w Oracle Cloud Console

⚠️ **WAŻNE** — Oracle Cloud blokuje porty domyślnie! Musisz je otworzyć:

1. Wejdź w **Oracle Cloud Console** → **Networking** → **Virtual Cloud Networks**
2. Kliknij swój VCN → **Security Lists** → **Default Security List**
3. Kliknij **"Add Ingress Rules"** i dodaj:

| Source CIDR | Protocol | Destination Port |
|-------------|----------|-----------------|
| 0.0.0.0/0 | TCP | 80 |
| 0.0.0.0/0 | TCP | 443 |

4. Zapisz zmiany

### 3b. Zainstaluj Docker na serwerze
```bash
# Zainstaluj Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Wyloguj się i zaloguj ponownie!
exit
ssh ubuntu@92.5.94.220

# Zainstaluj Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Sprawdź
docker --version
docker-compose --version
```

### 3c. Otwórz porty na firewallu systemu
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## KROK 4: Wgraj projekt na serwer

### Opcja A: Przez Git (zalecane)
```bash
cd ~
git clone https://github.com/hmvrek/gypsycfg.git
cd gypsycfg
```

Potem **zamień pliki** zaktualizowanymi wersjami z tego projektu Lovable:
- Pobierz projekt z Lovable (Settings → Export to GitHub lub ręcznie)
- Skopiuj pliki: `Dockerfile`, `nginx.conf`, `nginx-ssl.conf`, `docker-compose.yml`, `deploy.sh`, `setup-ssl.sh`, `supabase-schema.sql`, `.env.example`, oraz cały folder `src/`

### Opcja B: Przez SCP (bezpośrednie kopiowanie)
Na swoim komputerze:
```bash
scp -r ./* ubuntu@92.5.94.220:~/gypsycfg/
```

---

## KROK 5: Skonfiguruj zmienne środowiskowe

Na serwerze:
```bash
cd ~/gypsycfg
cp .env.example .env
nano .env
```

Wpisz swoje klucze Supabase:
```
VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...twoj-klucz
```

Zapisz: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## KROK 6: Zbuduj i uruchom stronę

```bash
cd ~/gypsycfg
chmod +x deploy.sh setup-ssl.sh
./deploy.sh
```

Sprawdź czy działa:
```bash
curl http://prodgypsy.xyz
```

Jeśli widzisz HTML — strona działa! 🎉

---

## KROK 7: Dodaj SSL (HTTPS) — za darmo z Let's Encrypt

⚠️ DNS musi już wskazywać na `92.5.94.220` zanim to zrobisz!

```bash
cd ~/gypsycfg
```

Edytuj `setup-ssl.sh` i zmień `your-email@example.com` na swój prawdziwy email:
```bash
nano setup-ssl.sh
```

Uruchom:
```bash
./setup-ssl.sh
```

Po zakończeniu strona będzie dostępna pod:
- ✅ `https://prodgypsy.xyz`
- ✅ `https://www.prodgypsy.xyz`
- 🔄 `http://prodgypsy.xyz` → automatycznie przekieruje na HTTPS

---

## KROK 8: Sprawdź czy wszystko działa

1. Wejdź na `https://prodgypsy.xyz`
2. Kliknij **+** → stwórz link testowy
3. Skopiuj skrócony URL
4. Otwórz go w trybie incognito → powinieneś zobaczyć stronę pobierania z reklamą
5. Kliknij Download → odliczanie 5s → reklama → plik się otwiera

---

## 🔧 Przydatne komendy

```bash
# Sprawdź status kontenerów
docker-compose ps

# Zobacz logi
docker-compose logs -f

# Restart po zmianach
docker-compose down && docker-compose up -d --build

# Aktualizacja strony (po zmianach w kodzie)
git pull  # lub scp nowych plików
docker-compose up -d --build
```

---

## ❓ Troubleshooting

### Strona nie ładuje się
1. Sprawdź czy kontenery działają: `docker-compose ps`
2. Sprawdź logi: `docker-compose logs gypsycfg`
3. Sprawdź firewall: `sudo iptables -L -n | grep 80`
4. Sprawdź Oracle Cloud Security List (porty 80/443 otwarte?)

### Linki nie zapisują się
1. Sprawdź `.env` — czy klucze Supabase są poprawne
2. Sprawdź Supabase dashboard → Table Editor → czy tabela `links` istnieje
3. Otwórz konsolę przeglądarki (F12) → sprawdź błędy sieciowe

### SSL nie działa
1. Sprawdź czy DNS wskazuje na `92.5.94.220`: `dig prodgypsy.xyz`
2. Poczekaj na propagację DNS
3. Uruchom `setup-ssl.sh` ponownie

---

## 📋 Podsumowanie architektury

```
Użytkownik → prodgypsy.xyz → Oracle Cloud (92.5.94.220)
                                    ↓
                              Docker + Nginx
                              (pliki statyczne)
                                    ↓
                         Supabase (baza danych)
                         (darmowy plan, hosting w chmurze)
```

- **Frontend:** React + Vite, serwowany jako pliki statyczne przez Nginx
- **Backend/DB:** Supabase Free Tier (PostgreSQL + REST API)
- **Reklamy:** Adsterra CPM (skrypt w AdModal)
- **SSL:** Let's Encrypt (darmowy, auto-renewal)
- **Koszt:** 0 zł/miesiąc 🎉
