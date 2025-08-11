import subprocess

# Loop through files GC-79.mp4 to GC-81.mp4
for i in range(78, 82):  # 82 is exclusive, so this covers 79, 80, 81
    input_video = f"GC-{i}.mp4"
    output_audio = f"GC-{i}.wav"

    print(f"Converting {input_video} → {output_audio}...")
    subprocess.run([
        "ffmpeg", "-i", input_video,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        output_audio
    ], check=True)

print("All conversions complete!")

# import subprocess
# import os

# def get_video_duration(input_video):
#     """Get the duration of the video in seconds"""
#     cmd = [
#         "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
#         "-of", "default=noprint_wrappers=1:nokey=1", input_video
#     ]
#     result = subprocess.run(cmd, capture_output=True, text=True)
#     return float(result.stdout.strip())

# def convert_video_to_audio_parts(input_video, num_parts=2):
#     """Convert video to audio and split into specified number of parts"""
#     base_name = os.path.splitext(input_video)[0]
    
#     # Get video duration
#     total_duration = get_video_duration(input_video)
#     part_duration = total_duration / num_parts
    
#     print(f"📹 Video duration: {total_duration:.2f} seconds")
#     print(f"🔪 Splitting into {num_parts} parts of {part_duration:.2f} seconds each")
    
#     audio_files = []
    
#     for i in range(num_parts):
#         start_time = i * part_duration
#         output_audio = f"{base_name}_part{i+1}.wav"
        
#         cmd = [
#             "ffmpeg", "-i", input_video,
#             "-ss", str(start_time),
#             "-t", str(part_duration),
#             "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
#             "-y",  # Overwrite output files
#             output_audio
#         ]
        
#         try:
#             print(f"🎵 Creating {output_audio}...")
#             subprocess.run(cmd, check=True)
#             audio_files.append(output_audio)
#             print(f"✅ Successfully created {output_audio}")
#         except subprocess.CalledProcessError as e:
#             print(f"❌ Error creating {output_audio}: {e}")
    
#     return audio_files

# # Usage
# input_video = "GC-76.mp4"

# # Split into 2 parts
# audio_parts = convert_video_to_audio_parts(input_video, num_parts=2)

# print(f"\n🎯 Created audio files:")
# for audio_file in audio_parts:
#     print(f"  📄 {audio_file}")



    # https://restream.io/tools/transcribe-audio-to-text?conversionId=2da7c7b4-97b1-49c9-8f4e-d3d9bff86f56