# Create a self-contained offline demonstration from this project.
from pathlib import Path
import re
P=Path(__file__).resolve().parents[1]
s=(P/'index.html').read_text(encoding='utf-8')
def css(m):return '<style>\n'+(P/m.group(1)).read_text(encoding='utf-8')+'\n</style>'
def js(m):return '<script>\n'+(P/m.group(1)).read_text(encoding='utf-8').replace('</script>','<\\/script>')+'\n</script>'
s=re.sub(r'<link rel="stylesheet" href="(assets/[^" ]+)"\s*/?>',css,s)
s=re.sub(r'<script src="(assets/[^" ]+)"></script>',js,s)
out=P.parent/(P.name+'_单文件体验版.html')
out.write_text(s,encoding='utf-8')
print(out)
