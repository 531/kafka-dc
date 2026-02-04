import React, { useState } from 'react';
import { 
  Truck, 
  Warehouse, 
  Layers, 
  Bookmark, 
  Copy, 
  Users, 
  UserCheck, 
  CheckCircle, 
  Brain, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FastForward,
  Columns
} from 'lucide-react';

// 用戶要求的特定參數配置
const AUTH_CONFIG = {
  "bearer.auth.logical.cluster": "",
  "bearer.auth.identity.pool.id": ""
};

const App = () => {
  const [hoveredTerm, setHoveredTerm] = useState(null);

  const termDefinitions = {
    Producer: { title: "Producer (生產者)", simple: "送貨員", desc: "將訊息發送到 Kafka。圖中顯示它已將貨物送到了最新的 Offset 位置。" },
    Broker: { title: "Broker (伺服器)", simple: "實體倉庫", desc: "負責存儲分區數據。多個 Broker 互相備援，確保數據不遺失。" },
    Topic: { title: "Topic (主題)", simple: "貨物分類", desc: "數據的邏輯分類單元，包含多個分區 (Partition)。" },
    Partition: { title: "Partition (分片)", simple: "物理分區", desc: "Topic 的物理拆分。數據實際存放的地方，是 Kafka 併行處理的最小單位。" },
    Offset: { title: "Offset (偏移量)", simple: "數據序號", desc: "Latest Offset (藍線) 是倉庫裡最新的貨物編號；Current Offset 是搬運工目前處理到的編號。" },
    Replicas: { title: "Replicas (副本)", simple: "備援資料", desc: "Leader 負責讀寫，Follower 則默默備份 Leader 的數據。" },
    ConsumerGroup: { title: "Consumer Group (消費者群組)", simple: "搬運工團隊", desc: "這組團隊正努力追趕最新貨物，目前進度標示為 Current Offset。" },
    Ack: { title: "Ack (確認機制)", simple: "簽收單", desc: "送貨員確認倉庫已將貨物存入正確位置的回傳訊號。" },
    Controller: { title: "Controller (控制器)", simple: "調度總監", desc: "負責管理所有倉庫的狀態，包含決定誰是 Leader。" },
    Lag: { title: "Lag (消費延遲)", simple: "待處理量", desc: "計算公式：Latest Offset (藍線) - Current Offset。藍線右側為空白，代表尚未有資料。" }
  };

  const Tooltip = () => {
    if (!hoveredTerm) return (
      <div className="text-slate-400 italic text-sm text-center animate-pulse">
        滑鼠移至標籤可查看物流邏輯定義
      </div>
    );
    const data = termDefinitions[hoveredTerm];
    return (
      <div className="bg-slate-800 text-white p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 w-full max-w-lg border border-slate-700">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Logistics System</span>
          <h3 className="font-bold text-lg text-blue-300">{data.title}</h3>
        </div>
        <p className="text-sm font-medium mb-1">白話：<span className="text-emerald-400">{data.simple}</span></p>
        <p className="text-xs text-slate-300 leading-relaxed">{data.desc}</p>
      </div>
    );
  };

  const FlowArrow = ({ className, label }) => (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-center w-full gap-1">
        <div className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 animate-shimmer" style={{ width: '40%', background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)', backgroundSize: '200% 100%' }}></div>
        </div>
        <ArrowRight size={20} className="text-blue-300" />
      </div>
      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );

  // 統一分區容器樣式
  const partitionBaseClass = "border rounded-lg p-2 h-[85px] flex flex-col justify-center transition-all relative";

  // 封裝 Partition 視覺組件 (Leader 版)
  const PartitionLeader = ({ id, latest, current, lag }) => {
    // 藍線固定在 85% 的位置，代表目前 Log 的末端 (LEO)
    const LEO_POS = 85; 
    const consumedWidth = (current / latest) * LEO_POS;
    const lagWidth = (lag / latest) * LEO_POS;

    return (
      <div 
        onMouseEnter={(e) => { e.stopPropagation(); setHoveredTerm('Partition'); }}
        className={`${partitionBaseClass} bg-white border-indigo-100 shadow-sm`}
      >
        <div className="flex justify-between items-center mb-1.5">
           <span className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
             <Columns size={10} className="text-indigo-400" /> Part-{id}
           </span>
           <span className="text-[7px] font-bold text-indigo-500 bg-indigo-50 px-1.5 rounded uppercase border border-indigo-100">LEADER</span>
        </div>
        <div className="relative h-4 bg-slate-100 rounded overflow-hidden flex mb-1 border border-slate-200/50">
           {/* 已消費資料 (綠色) */}
           <div className="h-full bg-emerald-400 shrink-0" style={{ width: `${consumedWidth}%` }}></div>
           {/* 積壓資料 (紅色) - 剛好到藍線停止 */}
           <div className="h-full bg-red-200 animate-pulse shrink-0" style={{ width: `${lagWidth}%` }}></div>
           
           {/* 最新資料標記線 (藍線 - LEO) */}
           <div 
             className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" 
             style={{ left: `${LEO_POS}%` }}
           >
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] font-black text-blue-600 whitespace-nowrap">
               LEO:{latest}
             </div>
           </div>
        </div>
        <div className="flex justify-between items-center text-[7px] font-bold">
           <div className="text-emerald-600 flex items-center gap-0.5">
             <Bookmark size={8} /> Current:{current}
           </div>
           <div className="text-red-500">Lag: {lag}</div>
        </div>
      </div>
    );
  };

  // 封裝 Partition 視覺組件 (Replica 版)
  const PartitionReplica = ({ id }) => (
    <div 
      onMouseEnter={(e) => { e.stopPropagation(); setHoveredTerm('Replicas'); }}
      className={`${partitionBaseClass} bg-slate-50/50 border-slate-100 border-dashed opacity-70`}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <Columns size={10} className="text-slate-300" />
        <span className="text-[8px] font-bold text-slate-400 uppercase">Part-{id}</span>
      </div>
      <div className="flex flex-col items-center justify-center mt-2">
        <Copy size={16} className="text-slate-300 mb-1" />
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">REPLICA</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter uppercase">Kafka 物流中心全景圖</h1>
          <div className="h-20 flex items-center justify-center">
            <Tooltip />
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-8 pb-12 relative">
          
          <div 
            onMouseEnter={() => setHoveredTerm('Controller')}
            onMouseLeave={() => setHoveredTerm(null)}
            className="absolute -top-6 right-1/4 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl cursor-help hover:scale-105 transition-transform z-30 border border-slate-700"
          >
            <Brain className="text-orange-400" size={24} />
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Manager</div>
              <div className="text-sm font-bold">Controller (調度總監)</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-center">
            
            <div className="col-span-2 flex flex-col items-center gap-6">
              <div onMouseEnter={() => setHoveredTerm('Producer')} onMouseLeave={() => setHoveredTerm(null)} className="relative flex flex-col items-center group cursor-help">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-100 transition-colors">
                  <Truck size={40} />
                </div>
                <div className="mt-3 bg-white border-2 border-blue-500 text-blue-600 px-4 py-1 rounded-full text-xs font-black shadow-sm uppercase">Producer</div>
                <div onMouseEnter={(e) => { e.stopPropagation(); setHoveredTerm('Ack'); }} className="absolute -bottom-8 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[9px] font-bold flex items-center gap-1"><CheckCircle size={10} /> Ack: OK</div>
              </div>
            </div>

            <div className="col-span-1 px-1">
              <FlowArrow className="w-full" label="Push" />
            </div>

            {/* Broker Cluster Section */}
            <div className="col-span-6 px-2">
              <div onMouseEnter={() => setHoveredTerm('Broker')} onMouseLeave={() => setHoveredTerm(null)} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[36px] p-6 relative cursor-help">
                <div className="absolute -top-3 left-6 bg-slate-200 text-slate-500 px-4 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Kafka Cluster</div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Broker 1 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-tighter ml-2"><Warehouse size={12} /> Broker 1</div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm min-h-[260px] flex flex-col">
                      <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-2 h-8 shrink-0">
                         <div onMouseEnter={(e) => { e.stopPropagation(); setHoveredTerm('Topic'); }} className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1"><Layers size={10} /> Topic: Orders</div>
                         <ShieldCheck size={14} className="text-emerald-500" title="High Availability" />
                      </div>

                      <div className="flex flex-col gap-3 flex-1">
                        <PartitionLeader id="0" latest={150} current={120} lag={30} />
                        <PartitionReplica id="1" />
                      </div>

                      <div onMouseEnter={(e) => { e.stopPropagation(); setHoveredTerm('Replicas'); }} className="mt-4 flex items-center gap-2 opacity-40 h-4 shrink-0 border-t pt-2 border-slate-50">
                         <Copy size={10} className="text-slate-400" />
                         <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">ISR Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Broker 2 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-tighter ml-2"><Warehouse size={12} /> Broker 2</div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm min-h-[260px] flex flex-col">
                      <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-2 h-8 shrink-0">
                         <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Layers size={10} /> Topic: Orders</div>
                         <ShieldCheck size={14} className="text-emerald-500" title="High Availability" />
                      </div>
                      
                      <div className="flex flex-col gap-3 flex-1">
                        <PartitionReplica id="0" />
                        <PartitionLeader id="1" latest={200} current={190} lag={10} />
                      </div>

                      <div className="mt-4 flex items-center gap-2 opacity-40 h-4 shrink-0 border-t pt-2 border-slate-50">
                         <ShieldCheck size={10} className="text-slate-400" />
                         <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Replicated</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                   <span className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-2 uppercase tracking-tight">
                     <FastForward size={10} /> Partitions distributed across brokers for scalability
                   </span>
                </div>
              </div>
            </div>

            <div className="col-span-1 px-1">
              <FlowArrow className="w-full" label="Pull" />
            </div>

            {/* Consumer Section */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <div onMouseEnter={() => setHoveredTerm('ConsumerGroup')} onMouseLeave={() => setHoveredTerm(null)} className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-5 w-full cursor-help shadow-lg mb-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-700">
                  <Users size={18} />
                  <span className="font-black text-[10px] uppercase tracking-tight text-center w-full">Group Workers</span>
                </div>
                <div className="space-y-2">
                  {['A', 'B'].map(char => (
                    <div key={char} className="bg-white p-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm transition-transform hover:translate-x-1">
                      <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-sm"><UserCheck size={14} /></div>
                      <span className="text-[9px] font-bold text-slate-600">Worker {char}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div onMouseEnter={() => setHoveredTerm('Lag')} onMouseLeave={() => setHoveredTerm(null)} className="flex flex-col items-center p-4 bg-red-50 rounded-2xl border border-red-100 cursor-help group transition-all hover:bg-red-100 w-full">
                <div className="text-red-500 mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><AlertTriangle size={16} className="animate-bounce" /> Total Lag</div>
                <div className="text-2xl font-black text-red-700">40 <span className="text-[10px] font-bold">msg</span></div>
                <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-[50%] animate-pulse"></div></div>
              </div>
            </div>

          </div>
        </div>

        {/* Legend Grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(termDefinitions).map(([id, data]) => (
            <div key={id} onMouseEnter={() => setHoveredTerm(id)} onMouseLeave={() => setHoveredTerm(null)} className={`p-3 rounded-2xl bg-white border transition-all cursor-help ${hoveredTerm === id ? 'border-blue-500 shadow-lg translate-y-[-2px]' : 'border-slate-200 opacity-75 hover:opacity-100'}`}>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{id}</div>
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                {data.simple}
                {id === 'Lag' && <div className="flex gap-0.5"><div className="w-1 h-3 bg-red-400 animate-pulse"></div><div className="w-1 h-3 bg-red-300 animate-pulse" style={{animationDelay: '0.2s'}}></div></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
      `}</style>
    </div>
  );
};

export default App;