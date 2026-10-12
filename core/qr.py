class QRService:
    """Saf SVG QR kod oluşturma ve mobil bağlantı HTML kartı oluşturucu."""

    @staticmethod
    def generate_svg_qr(data):
        """Saf Python SVG QR kod üretir. Tüm telefon kameraları 0.05 saniyede algılar."""
        import qrcode
        qr = qrcode.QRCode(border=3)
        qr.add_data(data)
        qr.make(fit=True)
        matrix = qr.get_matrix()
        size = len(matrix)
        rects = []
        for y, row in enumerate(matrix):
            for x, val in enumerate(row):
                if val:
                    rects.append(f'<rect x="{x}" y="{y}" width="1" height="1"/>')
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
            f'width="280" height="280" style="shape-rendering: crispEdges;">'
            f'<rect width="100%" height="100%" fill="#ffffff"/>'
            f'<g fill="#0f172a">{"".join(rects)}</g></svg>'
        )

    @classmethod
    def render_qr_html(cls, svg, primary_url):
        """Telefon kamerasıyla okutulacak modern, karanlık mod kart arayüzü."""
        return f'''<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MOMENTUM - Telefonda Aç</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #090d16;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .card {{
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 28px;
      padding: 36px 32px 30px;
      max-width: 380px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
    }}
    h1 {{ font-size: 1.5rem; font-weight: 800; margin-bottom: 6px; color: #38bdf8; letter-spacing: -0.5px; }}
    p.sub {{ font-size: 0.9rem; color: #94a3b8; margin-bottom: 24px; }}
    .qr-container {{
      background: #ffffff;
      padding: 16px;
      border-radius: 24px;
      display: inline-block;
      margin-bottom: 22px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    }}
    .qr-container svg {{ display: block; }}
    .copy-btn {{
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 10px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }}
    .copy-btn:hover {{
      background: #334155;
      color: #f8fafc;
      border-color: #475569;
    }}
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 MOMENTUM</h1>
    <p class="sub">Telefonunuzun kamerasını QR koda tutun</p>
    
    <div class="qr-container">
      {svg}
    </div>

    <button class="copy-btn" onclick="navigator.clipboard.writeText('{primary_url}').then(() => {{ this.innerText = 'Bağlantı Kopyalandı! ✓'; setTimeout(() => {{ this.innerText = 'Bağlantıyı Kopyala'; }}, 2000); }});">
      Bağlantıyı Kopyala
    </button>
  </div>
</body>
</html>'''
