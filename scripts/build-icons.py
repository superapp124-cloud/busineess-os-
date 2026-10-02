import os
import cv2
import numpy as np
from PIL import Image

def build_assets():
    # 1. Load the original pristine logo
    logo_path = 'public/chatr-logo.png'
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"Missing {logo_path}")
    
    logo = Image.open(logo_path).convert('RGBA')
    logo_arr = np.array(logo)
    
    # Extract exact teal badge: x: 682..926, y: 344..602
    badge_crop = logo.crop((682, 344, 926, 602))
    badge_arr = np.array(badge_crop)
    h, w = badge_arr.shape[:2]
    
    # Separate outer transparent background from inner speech bubble hole
    from collections import deque
    is_transparent = badge_arr[:, :, 3] < 128
    visited = np.zeros((h, w), dtype=bool)
    outer = np.zeros((h, w), dtype=bool)
    q = deque()
    
    for x in range(w):
        if is_transparent[0, x]:
            q.append((0, x)); visited[0, x] = True
        if is_transparent[h-1, x]:
            q.append((h-1, x)); visited[h-1, x] = True
    for y in range(h):
        if is_transparent[y, 0]:
            q.append((y, 0)); visited[y, 0] = True
        if is_transparent[y, w-1]:
            q.append((y, w-1)); visited[y, w-1] = True
            
    while q:
        cy, cx = q.popleft()
        outer[cy, cx] = True
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_transparent[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
                
    inner_hole = is_transparent & (~outer)
    
    # Badge with solid white inner chat bubble
    clean_badge_arr = badge_arr.copy()
    clean_badge_arr[inner_hole] = [255, 255, 255, 255]
    clean_badge_arr[outer] = [0, 0, 0, 0]
    
    clean_badge = Image.fromarray(clean_badge_arr, 'RGBA')
    bbox = clean_badge.getbbox()
    tight_badge = clean_badge.crop(bbox) # exact tight bounding box
    
    print(f"Tight badge dimensions: {tight_badge.size}")
    
    # 2. Helper to center tight badge on a square canvas with proportional padding
    def make_square_icon(size, padding_ratio=0.08):
        # padding_ratio gives standard breathing room around the badge
        pad = int(size * padding_ratio)
        max_dim = size - 2 * pad
        
        # Scale tight badge keeping aspect ratio
        scale = max_dim / max(tight_badge.width, tight_badge.height)
        new_w = int(tight_badge.width * scale)
        new_h = int(tight_badge.height * scale)
        
        scaled = tight_badge.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        ox = (size - new_w) // 2
        oy = (size - new_h) // 2
        canvas.paste(scaled, (ox, oy), scaled)
        return canvas

    icon_1024 = make_square_icon(1024, padding_ratio=0.07)
    icon_512 = make_square_icon(512, padding_ratio=0.07)
    icon_192 = make_square_icon(192, padding_ratio=0.07)
    icon_128 = make_square_icon(128, padding_ratio=0.07)
    icon_64 = make_square_icon(64, padding_ratio=0.07)
    icon_48 = make_square_icon(48, padding_ratio=0.07)
    icon_32 = make_square_icon(32, padding_ratio=0.07)
    icon_16 = make_square_icon(16, padding_ratio=0.07)
    
    # 3. Save standard web & app icons
    # Target files to write:
    targets = {
        'public/favicon.png': icon_512,
        'public/favicon-32x32.png': icon_32,
        'public/favicon-16x16.png': icon_16,
        'public/icons/icon-512x512.png': icon_512,
        'public/icons/icon-192x192.png': icon_192,
        'public/assets/chatrplus-logo512.png': icon_512,
        'public/chatr-icon-logo.png': icon_1024,
        'src/assets/chatr-icon-logo.png': icon_1024,
        'public/store-assets/icon-512.png': icon_512,
        'android/app/src/main/res/drawable-nodpi/chatr_splash_mark.png': icon_512,
    }
    
    for path, img in targets.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.save(path, format='PNG')
        print(f"Generated {path} ({img.size})")

    # 4. Generate multi-resolution ICO files
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon_512.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
    print("Generated public/favicon.ico with multi-resolution frames (16..256)")
    
    icon_512.save('public/icon.ico', format='ICO', sizes=ico_sizes)
    print("Generated public/icon.ico with multi-resolution frames (16..256)")

    # 5. Also copy to dist and ios/android assets if they exist
    copies = [
        ('public/favicon.ico', 'dist/favicon.ico'),
        ('public/favicon.png', 'dist/favicon.png'),
        ('public/favicon.ico', 'dist-desktop/favicon.ico'),
        ('public/favicon.png', 'dist-desktop/favicon.png'),
        ('public/icon.ico', 'dist-desktop/icon.ico'),
        ('public/icons/icon-192x192.png', 'dist/icons/icon-192x192.png'),
        ('public/icons/icon-512x512.png', 'dist/icons/icon-512x512.png'),
        ('public/icons/icon-192x192.png', 'dist-desktop/icons/icon-192x192.png'),
        ('public/icons/icon-512x512.png', 'dist-desktop/icons/icon-512x512.png'),
        ('public/favicon.ico', 'ios/App/App/public/favicon.ico'),
        ('public/favicon.png', 'ios/App/App/public/favicon.png'),
        ('public/icons/icon-192x192.png', 'ios/App/App/public/icons/icon-192x192.png'),
        ('public/icons/icon-512x512.png', 'ios/App/App/public/icons/icon-512x512.png'),
        ('public/assets/chatrplus-logo512.png', 'ios/App/App/public/assets/chatrplus-logo512.png'),
        ('public/store-assets/icon-512.png', 'ios/App/App/public/store-assets/icon-512.png'),
        ('public/favicon.ico', 'android/app/src/main/assets/public/favicon.ico'),
        ('public/favicon.png', 'android/app/src/main/assets/public/favicon.png'),
        ('public/icons/icon-192x192.png', 'android/app/src/main/assets/public/icons/icon-192x192.png'),
        ('public/icons/icon-512x512.png', 'android/app/src/main/assets/public/icons/icon-512x512.png'),
    ]
    
    for src, dst in copies:
        if os.path.exists(os.path.dirname(dst)):
            import shutil
            shutil.copyfile(src, dst)
            print(f"Copied {src} -> {dst}")

    # 6. Generate Android density mipmaps for legacy launcher fallback
    # mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192
    android_res_base = 'android/app/src/main/res'
    mipmap_targets = {
        'mipmap-mdpi': make_square_icon(48, padding_ratio=0.06),
        'mipmap-hdpi': make_square_icon(72, padding_ratio=0.06),
        'mipmap-xhdpi': make_square_icon(96, padding_ratio=0.06),
        'mipmap-xxhdpi': make_square_icon(144, padding_ratio=0.06),
        'mipmap-xxxhdpi': make_square_icon(192, padding_ratio=0.06),
    }
    for folder, img in mipmap_targets.items():
        folder_path = os.path.join(android_res_base, folder)
        os.makedirs(folder_path, exist_ok=True)
        img.save(os.path.join(folder_path, 'ic_launcher.png'), format='PNG')
        img.save(os.path.join(folder_path, 'ic_launcher_round.png'), format='PNG')
        print(f"Generated Android {folder}/ic_launcher.png ({img.size})")

    # 7. Generate clean SVG vector favicon
    # We can create a crisp scalable SVG representation
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Brand teal gradient -->
    <linearGradient id="chatrTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2CE" />
      <stop offset="100%" stop-color="#00A89F" />
    </linearGradient>
  </defs>
  <!-- Outer Speech Bubble Rounded Badge -->
  <path d="M 120 48
           L 392 48
           A 72 72 0 0 1 464 120
           L 464 360
           A 72 72 0 0 1 392 432
           L 140 432
           L 64 480
           L 76 416
           A 72 72 0 0 1 48 360
           L 48 120
           A 72 72 0 0 1 120 48
           Z"
        fill="url(#chatrTealGrad)" />
  <!-- Inner White Speech Bubble -->
  <path d="M 200 152
           L 312 152
           A 56 56 0 0 1 368 208
           L 368 280
           A 56 56 0 0 1 312 336
           L 216 336
           L 168 368
           L 176 328
           A 56 56 0 0 1 144 280
           L 144 208
           A 56 56 0 0 1 200 152
           Z"
        fill="#FFFFFF" />
</svg>'''
    with open('public/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    if os.path.exists('dist'):
        with open('dist/favicon.svg', 'w', encoding='utf-8') as f:
            f.write(svg_content)
    print("Generated public/favicon.svg")

if __name__ == '__main__':
    build_assets()
