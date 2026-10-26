"""Share repeated embedded CSS images without changing their bytes or rendering."""
import collections
import hashlib
import re

URL = re.compile(r'''url\((["']?)(data:[^)\s"']+)\1\)''')


def share_style_images(page):
    def optimize(match):
        css = match.group(1)
        counts = collections.Counter(m.group(2) for m in URL.finditer(css))
        shared = {data: '--build-image-' + hashlib.sha256(data.encode()).hexdigest()
                  for data, count in counts.items() if count > 1 and len(data) > 512}
        css = URL.sub(lambda m: 'var(' + shared[m.group(2)] + ')' if m.group(2) in shared else m.group(0), css)
        pool = ':root{' + ''.join(name + ':url("' + data + '");' for data, name in shared.items()) + '}\n'
        return '<style>' + css + pool + '</style>'
    return re.sub(r'<style>([\s\S]*?)</style>', optimize, page)
