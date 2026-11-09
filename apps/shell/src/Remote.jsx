import { Component, Suspense, lazy, useMemo, useState } from "react";
import { loadRemote } from "./loadRemote";
class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[remote failure]", this.props.name, error, info);
  }
  render() {
    return this.state.error ? (
      <div className="panel" role="alert">
        <h2>{this.props.name} đang gián đoạn</h2>
        <p>Các phần khác của Shell vẫn hoạt động.</p>
        <button onClick={this.props.retry}>Thử lại</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Remote({ name, ...props }) {
  const [attempt, setAttempt] = useState(0);
  const View = useMemo(() => lazy(() => loadRemote(name)), [name, attempt]);
  return (
    <Boundary
      key={name + attempt}
      name={name}
      retry={() => setAttempt((n) => n + 1)}
    >
      <Suspense fallback={<p role="status">Đang tải {name}…</p>}>
        <View {...props} />
      </Suspense>
    </Boundary>
  );
}
