"""Cache a bounded Oman basemap for reliable presentation without a network connection."""
from pathlib import Path
import math, urllib.request, concurrent.futures, time
ROOT = Path(__file__).resolve().parents[1] / 'public' / 'map-tiles-nasa'
def xy(lat, lon, z):
    n=2**z
    return int((lon+180)/360*n), int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)
tasks=[]
for z in range(6,9):
    xa,ya=xy(27,53,z); xb,yb=xy(19.5,61,z)
    tasks += [(z,x,y) for x in range(xa,xb+1) for y in range(ya,yb+1)]
def get(task):
    z,x,y=task; path=ROOT/str(z)/str(x)/f'{y}.jpg'
    if path.exists(): return True
    path.parent.mkdir(parents=True,exist_ok=True)
    for attempt in range(3):
        try:
            req=urllib.request.Request(f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/2004-07-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',headers={'User-Agent':'ASTRA-prototype/1.0'})
            with urllib.request.urlopen(req,timeout=20) as r: path.write_bytes(r.read())
            return True
        except Exception: time.sleep(attempt+1)
    return False
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    result=list(pool.map(get,tasks))
print(f'Cached {sum(result)}/{len(tasks)} Oman map tiles')
if not all(result): raise SystemExit(1)
