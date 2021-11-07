import { useRef, useState, useCallback, useMemo } from 'react';
import { getStream } from './twitch';
import { ReactHlsPlayer } from './ReactHlsPlayer';

type Stream = { quality: string, resolution: string, url: string }

const App = () => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selection, setSelection] = useState<number>(0);
  const playerRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (channel: string) => {
    try {
      setStatus("⌛");
      const data = await getStream(channel) as Stream[];
      if (data && data.length > 0) {
        setStatus("✔️");
        setStreams(data);
      } else {
        setStatus("❌");
      }
    }
    catch (e) {
      console.error(e);
      setStatus("❌");
    }
  }, [name]);

  const onNameChange = useCallback(e => {
    const channel = e.target.value;
    setName(channel);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => load(channel), 500);
  }, [load])

  const onSelect = useCallback((e) => {
    setSelection(e.target.value);
  }, [])

  const selectedUrl = useMemo(() => {
    if (selection < streams.length) {
      console.log(selection);
      console.log(streams);
      return streams[selection].url;
    }
  }, [selection, streams])

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <div style={{ flex: 0, display: "flex", alignItems: "center", marginBottom: 8 }}>
        <input onChange={onNameChange} />
        {status}
        {streams && streams.length > 0 &&
          <select value={selection} onChange={onSelect}>
            {streams.map((stream, i) => <option value={i} key={i}>{stream.quality}</option>)}
          </select>
        }
      </div>
      {selectedUrl &&
        <ReactHlsPlayer
          src={selectedUrl}
          autoPlay={true}
          controls={true}
          width="100%"
          height="auto"
          playerRef={playerRef}
        />
      }
    </div>
  );
}

export default App;

