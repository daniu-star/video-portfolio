from PIL import Image,ImageDraw,ImageFont,ImageOps
from pathlib import Path
root=Path(__file__).resolve().parents[1]
dir=root/'docs'/'qa_v8'
items=[('01 · 问诊后自动双人报告','zhou_1440_report.png'),('02 · 人物不同，报告同样可触发','lin_1440_report.png'),('03 · 城乡原话与AI记录的差异','zhou_1440_rural_report.png'),('04 · 第一次复用立即出交易凭证','factory_first_call_report.png')]
S=(1600,1140);canvas=Image.new('RGB',S,'#111e28');draw=ImageDraw.Draw(canvas)
font='/usr/share/fonts/truetype/wqy/wqy-microhei.ttc'
if not Path(font).exists():
 import glob
 font=glob.glob('/usr/share/fonts/**/*ttf',recursive=True)[0]
f=ImageFont.truetype(font,24)
head=ImageFont.truetype(font,31)
draw.text((48,20),'肉身审计局 v8  ·  三幕结果反馈系统',font=head,fill='#EAE5D8')
for i,(title,fname) in enumerate(items):
 col=i%2;row=i//2;x=48+col*774;y=85+row*524
 draw.rounded_rectangle((x,y,x+738,y+493),radius=14,fill='#263945')
 im=Image.open(dir/fname).convert('RGB');im.thumbnail((714,445))
 crop=Image.new('RGB',(714,445),'#132631');crop.paste(im,((714-im.width)//2,0))
 canvas.paste(crop,(x+12,y+12));draw.text((x+17,y+460),title,font=f,fill='#DFCDAB')
canvas.save(root/'docs/qa_v8/v8_三幕内容迭代实际截图.jpg',quality=88)
