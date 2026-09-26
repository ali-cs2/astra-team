"""Fetch attributable public observations/forecasts; never generate measurements."""
from pathlib import Path
from datetime import datetime, timezone
import json, math, concurrent.futures, requests
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
sites = json.loads((BASE / 'src/data/locations.json').read_text(encoding='utf-8'))

def save_json(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

weather_url='https://api.open-meteo.com/v1/forecast'
params={'latitude':','.join(str(s['coordinates'][0]) for s in sites),
        'longitude':','.join(str(s['coordinates'][1]) for s in sites),
        'hourly':'cloud_cover,relative_humidity_2m,visibility',
        'daily':'sunset,sunrise','forecast_days':3,'timezone':'Asia/Muscat'}
r=requests.get(weather_url,params=params,timeout=30); r.raise_for_status()
save_json(BASE / 'public/data/weather-snapshot.json',{
    'fetchedAt':datetime.now(timezone.utc).isoformat(),'requestUrl':r.url,
    'source':'Open-Meteo forecast API; CC BY 4.0','data':r.json()})
print('Saved actual weather response:',r.url)

# Place references have their own sequential, rate-limited refresh script:
# python scripts/fetch-nominatim.py

def xy(lat,lon,z):
    n=2**z
    return int((lon+180)/360*n),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)

tasks=[]
for year in [2012,2016]:
    for z in range(6,9):
        xa,ya=xy(27,53,z); xb,yb=xy(19.5,61,z)
        tasks.extend((year,z,x,y) for x in range(xa,xb+1) for y in range(ya,yb+1))
def tile(task):
    year,z,x,y=task
    dest=BASE / f'public/map-tiles-night/{year}/{z}/{x}/{y}.png'
    if dest.exists(): return True
    url=f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/{year}-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png'
    try:
        r=requests.get(url,timeout=25);r.raise_for_status()
        if not r.headers.get('Content-Type','').startswith('image/'): raise ValueError('Not an image')
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(r.content)
        return True
    except Exception as e:
        print('Tile failed:',task,str(e));return False
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results=list(pool.map(tile,tasks))
print('NASA Black Marble tiles:',sum(results),'/',len(results))
if not all(results): raise SystemExit('Missing NASA tiles')

# Geographic crop of the same bounds for both years. No generated imagery.
z=8; west,east,south,north=57.2,59.6,22.7,24.1
def pixel(lat,lon):
    n=2**z*256
    return (lon+180)/360*n,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
px0,py0=pixel(north,west); px1,py1=pixel(south,east)
xa,ya=int(px0//256),int(py0//256); xb,yb=int(px1//256),int(py1//256)
for year in [2012,2016]:
    mosaic=Image.new('RGB',((xb-xa+1)*256,(yb-ya+1)*256))
    for x in range(xa,xb+1):
        for y in range(ya,yb+1):
            im=Image.open(BASE / f'public/map-tiles-night/{year}/{z}/{x}/{y}.png').convert('RGB')
            mosaic.paste(im,((x-xa)*256,(y-ya)*256))
    crop=mosaic.crop((px0-xa*256,py0-ya*256,px1-xa*256,py1-ya*256))
    dest=BASE / f'public/images/observations/muscat-{year}.webp'
    dest.parent.mkdir(parents=True,exist_ok=True)
    crop.save(dest,quality=95,method=6)
save_json(BASE / 'public/data/imagery-provenance.json',{
    'source':'NASA GIBS / VIIRS Black Marble','years':[2012,2016],
    'bounds':[west,south,east,north],'projection':'Web Mercator',
    'nativeZoom':8,'description':'Display imagery only, not calibrated radiance or ground sky brightness.',
    'sourceUrl':'https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/',
    'tileTemplate':'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/{year}-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    'retrievedAt':datetime.now(timezone.utc).isoformat()})
