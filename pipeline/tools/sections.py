import json,glob,collections,hashlib,sys
from bs4 import BeautifulSoup, Tag
INLINE={"a","strong","b","em","i","span","br","sup","sub","small","u","mark","abbr"}
def is_rich(el):
    # element whose children are only text and inline tags (recursively) -> leaf "rich text"
    for c in el.descendants:
        if isinstance(c,Tag) and (c.name not in INLINE or (c.name=="i" and c.get("class"))): return False
    return True
def sk(el):
    """collapsed skeleton: repeated identical sibling skeletons -> [x]*"""
    if el.name=="fp-block": return f"<fp-block {el.get('data-name')}>"
    head=f"<{el.name} {'.'.join(sorted(el.get('class',[])))}{' #'+el['id'] if el.get('id') else ''}>"
    kids=[c for c in el.children if isinstance(c,Tag)]
    if el.name in ("p","h1","h2","h3","h4","h5","h6","li","span","a","label","button","td","th","figcaption","blockquote") and is_rich(el):
        return head+"~rich"
    parts=[]; prev=None
    for k in kids:
        s=sk(k)
        if s==prev: 
            if not parts[-1].endswith("*"): parts[-1]=parts[-1]+"*"
            continue
        parts.append(s); prev=s
    return head+"("+",".join(parts)+")"
def top(html):
    s=BeautifulSoup(html,"html.parser"); return [c for c in s.children if isinstance(c,Tag)]
if __name__=="__main__":
    types=sys.argv[1].split(",")
    recs=[]
    for f in glob.glob('content/pages/*.json'): recs+=json.load(open(f))
    recs=[r for r in recs if r['type'] in types]
    c=collections.Counter(); ex={}; seqs=collections.Counter()
    for r in recs:
        seq=[]
        for el in top(r['body']):
            h=hashlib.md5(sk(el).encode()).hexdigest()[:8]; c[h]+=1; ex.setdefault(h,(r['path'],el.name,' '.join(el.get('class',[]))[:60])); seq.append(h)
        seqs[" ".join(seq)]+=1
    print(len(recs),"pages; distinct top-level section skeletons:",len(c), "distinct page sequences:",len(seqs))
    for h,n in c.most_common(int(sys.argv[2]) if len(sys.argv)>2 else 40): print(n,h,ex[h])
