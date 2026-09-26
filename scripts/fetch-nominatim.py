from pathlib import Path
from datetime import datetime,timezone
import requests,json,time
base=Path(__file__).resolve().parents[1]
places=[]
names=[('Muscat','center','مسقط','#e8b46f'),('Seeb','seeb','السيب','#cb8e57'),('Nizwa','nizwa','نزوى','#b77958'),('Ibra','ibra','إبراء','#8cbad0'),('Sur','sur','صور','#73958e')]
for name,ident,arabic,color in names:
    url='https://nominatim.openstreetmap.org/search'
    r=requests.get(url,params={'q':f'{name}, Oman','countrycodes':'om','format':'jsonv2','limit':1,'accept-language':'en'},headers={'User-Agent':'ASTRA-Oman-research-prototype/1.0'},timeout=15)
    r.raise_for_status();j=r.json()
    (base/f'qa/source-research/nominatim-{ident}.json').write_text(json.dumps({'requestUrl':r.url,'response':j},ensure_ascii=False,indent=2),encoding='utf-8')
    if not j:raise ValueError(f'No place for {name}')
    v=j[0]
    places.append({'id':ident,'name':[name,arabic],'coordinates':[float(v['lat']),float(v['lon'])],'color':color,
        'osmId':v['osm_id'],'osmType':v['osm_type'],'url':f"https://www.openstreetmap.org/{v['osm_type']}/{v['osm_id']}",
        'retrievedAt':datetime.now(timezone.utc).isoformat(),'source':'OpenStreetMap / Nominatim','displayName':v['display_name']})
    print(name,v['osm_type'],v['osm_id'],v['lat'],v['lon'],flush=True)
    time.sleep(1.1)
(base/'src/data/sourceContributions.json').write_text(json.dumps(places,ensure_ascii=False,indent=2),encoding='utf-8')
