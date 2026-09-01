with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_logic = """  const defaultWidgetOrder = ['bank', 'cash', 'cc', 'inv', 'rec', 'debt', 'income', 'expense'];
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardWidgetOrder');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultWidgetOrder;
  });"""

new_logic = """  const defaultWidgetOrder = ['bank', 'cash', 'cc', 'inv', 'rec', 'debt', 'income', 'expense'];
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardWidgetOrder');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (!parsed.includes('income')) parsed.push('income');
        if (!parsed.includes('expense')) parsed.push('expense');
        return parsed;
      }
    } catch(e) {}
    return defaultWidgetOrder;
  });"""

code = code.replace(old_logic, new_logic)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Widget logic fixed')
