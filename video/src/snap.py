import sys
import os, pathlib
from playwright.sync_api import sync_playwright
PAGE=pathlib.Path(__file__).with_name('index.html').resolve().as_uri()
ts=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
    pg=b.new_page(viewport={'width':1920,'height':1080})
    pg.goto(PAGE); pg.wait_for_timeout(500)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    for t in ts:
        pg.evaluate(f'render({t})'); pg.screenshot(path=f'snap_{t:05.1f}.jpg',type='jpeg',quality=70)
    print('errors',errs)
    b.close()
