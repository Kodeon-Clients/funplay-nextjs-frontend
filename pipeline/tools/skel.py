"""Structure analysis helper: skeleton of a page body (tags + classes, no text)."""
import json,glob,re,collections,hashlib,difflib,sys
from bs4 import BeautifulSoup, Tag
def skel(html, depth_limit=99):
    s=BeautifulSoup(html,"html.parser"); out=[]
    def w(n,d):
        for c in n.children:
            if isinstance(c,Tag):
                ident = c.get('id') or ''
                out.append(f"{'  '*d}<{c.name} {'.'.join(sorted(c.get('class',[])))} #{ident}>")
                if c.name!="fp-block" and d<depth_limit: w(c,d+1)
    w(s,0); return out
def load(t):
    recs=[]
    for f in glob.glob('/home/claude/funplay/site/content/pages/*.json'): recs+=json.load(open(f))
    return [r for r in recs if r['type']==t]
if __name__=="__main__":
    t=sys.argv[1]; recs=load(t)
    groups=collections.defaultdict(list)
    for r in recs: groups[hashlib.md5("\n".join(skel(r['body'])).encode()).hexdigest()].append(r)
    g=sorted(groups.values(), key=len, reverse=True)
    ref=skel(g[0][0]['body'])
    print("REF", g[0][0]['path'], len(g[0]), len(ref), "lines")
    for grp in g[1:int(sys.argv[2]) if len(sys.argv)>2 else 6]:
        d=[l for l in difflib.unified_diff(ref, skel(grp[0]['body']), n=0, lineterm="") if not l.startswith(('---','+++','@@'))]
        print("\n==", grp[0]['path'], len(grp), "diff lines", len(d)); print("\n".join(d[:25]))
