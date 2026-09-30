import subprocess,time
import os, pathlib
from playwright.sync_api import sync_playwright
PAGE=pathlib.Path(__file__).with_name('index.html').resolve().as_uri()
FPS=30;N=30*FPS
ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','RouteResilience_demo.mp4'],stdin=subprocess.PIPE)
t0=time.time()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
    pg=b.new_page(viewport={'width':1920,'height':1080})
    pg.goto(PAGE); pg.wait_for_timeout(600)
    for i in range(N):
        pg.evaluate(f'render({i/FPS})')
        ff.stdin.write(pg.screenshot(type='jpeg',quality=95))
        if i%150==0: print(i,round(time.time()-t0,1),flush=True)
    b.close()
ff.stdin.close();ff.wait();print('done',round(time.time()-t0,1))
