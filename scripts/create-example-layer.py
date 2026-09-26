"""Generate local illustrative light-pollution GeoJSON, independent of UI components."""
import math,json
from pathlib import Path
features=[]
for lon,lat,scale in [(58.38,23.59,1),(58.16,23.65,.65),(58.54,23.61,.7),(57.95,23.68,.45),(57.63,23.22,.25),(58.69,22.53,.18)]:
    for radius,color,opacity in [(.32,'#337684',.08),(.22,'#d0a660',.13),(.14,'#d48c50',.18),(.07,'#cc633e',.2)]:
        points=[[round(lon+math.cos(i*math.tau/64)*radius*scale*1.7,5),round(lat+math.sin(i*math.tau/64)*radius*scale*.65,5)] for i in range(65)]
        points[-1]=points[0]
        features.append({'type':'Feature','properties':{'color':color,'opacity':opacity,'scenario':'Muscat illustrative light field'},'geometry':{'type':'Polygon','coordinates':[points]}})
path=Path(__file__).resolve().parents[1]/'src/data/lightPollution.json'
path.write_text(json.dumps({'type':'FeatureCollection','features':features}),encoding='utf8')
