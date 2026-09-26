"""Compose a wider, identical geographic view for both NASA comparison years."""
from pathlib import Path
from PIL import Image
import math,json

base=Path(__file__).resolve().parents[1]
z=8
west,south,east,north=55.5,22.4,60.5,24.0
def pixel(lat,lon):
    n=2**z*256
    return (lon+180)/360*n,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n
left,top=pixel(north,west); right,bottom=pixel(south,east)
xa,ya=int(left//256),int(top//256); xb,yb=int(right//256),int(bottom//256)
for year in [2012,2016]:
    mosaic=Image.new('RGB',((xb-xa+1)*256,(yb-ya+1)*256))
    for x in range(xa,xb+1):
        for y in range(ya,yb+1):
            tile=Image.open(base/f'public/map-tiles-night/{year}/{z}/{x}/{y}.png').convert('RGB')
            mosaic.paste(tile,((x-xa)*256,(y-ya)*256))
    region=mosaic.crop((round(left-xa*256),round(top-ya*256),round(right-xa*256),round(bottom-ya*256)))
    region.save(base/f'public/images/observations/northern-oman-{year}.webp',quality=95,method=6)
    print(year,region.size)
path=base/'public/data/imagery-provenance.json'
metadata=json.loads(path.read_text(encoding='utf-8'))
metadata['comparison']={'bounds':[west,south,east,north],'projection':'Web Mercator','nativeZoom':z,
    'files':['northern-oman-2012.webp','northern-oman-2016.webp'],
    'description':'Wider northern Oman region, identical bounds and dimensions in both years. Original NASA display pixels; no enhancement or generated detail.'}
path.write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
