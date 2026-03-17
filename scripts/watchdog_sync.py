"""
MotionFlow 自动同步脚本
监听指定目录的新文件，自动上传到 Supabase 并创建数据库记录
"""

import os
import time
import mimetypes
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
WATCH_DIRECTORY = os.getenv('WATCH_DIRECTORY', './watch')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SUPPORTED_EXTENSIONS = {'.mp4', '.webp', '.gif', '.json'}

class MotionFileHandler(FileSystemEventHandler):
    def __init__(self):
        self.processing = set()

    def on_created(self, event):
        if event.is_directory:
            return

        file_path = Path(event.src_path)
        
        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            return

        if file_path.name in self.processing:
            return

        time.sleep(1)

        self.processing.add(file_path.name)
        
        try:
            self.process_file(file_path)
        except Exception as e:
            print(f'处理文件失败 {file_path.name}: {e}')
        finally:
            self.processing.discard(file_path.name)

    def process_file(self, file_path: Path):
        print(f'检测到新文件: {file_path.name}')

        original_name = file_path.stem
        parts = original_name.split('_')
        
        brand_name = parts[0] if len(parts) > 0 else ''
        app_name = parts[1] if len(parts) > 1 else ''
        title = '_'.join(parts[2:]) if len(parts) > 2 else original_name

        timestamp = int(time.time() * 1000)
        new_filename = f"{timestamp}_{file_path.name}"
        storage_path = f"motions/{new_filename}"

        print(f'上传文件到 Supabase Storage: {storage_path}')
        
        with open(file_path, 'rb') as f:
            file_data = f.read()
            
            mime_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            result = supabase.storage.from_('motions').upload(
                storage_path,
                file_data,
                file_options={'content-type': mime_type}
            )

        public_url_response = supabase.storage.from_('motions').get_public_url(storage_path)
        public_url = public_url_response

        file_type = 'lottie' if file_path.suffix == '.json' else file_path.suffix[1:]

        brand_id = None
        if brand_name:
            brand_result = supabase.table('brands').select('id').eq('name', brand_name).execute()
            if brand_result.data and len(brand_result.data) > 0:
                brand_id = brand_result.data[0]['id']

        motion_data = {
            'storage_path': public_url,
            'title': title or None,
            'brand_id': brand_id,
            'app_name': app_name or None,
            'file_type': file_type,
        }

        print(f'创建数据库记录: {motion_data}')
        
        supabase.table('motions').insert(motion_data).execute()

        print(f'✓ 文件处理完成: {file_path.name}')

def main():
    watch_path = Path(WATCH_DIRECTORY)
    
    if not watch_path.exists():
        print(f'创建监听目录: {watch_path}')
        watch_path.mkdir(parents=True, exist_ok=True)

    print(f'开始监听目录: {watch_path.absolute()}')
    print(f'支持的文件格式: {", ".join(SUPPORTED_EXTENSIONS)}')
    print('按 Ctrl+C 停止监听\n')

    event_handler = MotionFileHandler()
    observer = Observer()
    observer.schedule(event_handler, str(watch_path), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print('\n监听已停止')
    
    observer.join()

if __name__ == '__main__':
    main()
