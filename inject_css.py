with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

target = '.widget-debt { background: linear-gradient(135deg, #F43F5E 0%, #BE123C 100%); }'
replacement = '''.widget-debt { background: linear-gradient(135deg, #F43F5E 0%, #BE123C 100%); }
.widget-income { background: linear-gradient(135deg, #14B8A6 0%, #0F766E 100%); }
.widget-expense { background: linear-gradient(135deg, #F97316 0%, #C2410C 100%); }'''

css = css.replace(target, replacement)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
