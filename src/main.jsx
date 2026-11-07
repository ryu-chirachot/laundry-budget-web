import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalendarDays, WashingMachine, Wind, Users, Wallet, Settings2, ChevronDown } from "lucide-react";
import "./style.css";

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const money = n => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseDate = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d,12); };
const monthName = d => new Intl.DateTimeFormat("th-TH", { month:"long", year:"numeric" }).format(d);
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const monthStart = d => new Date(d.getFullYear(), d.getMonth(), 1, 12);
const monthEnd = d => new Date(d.getFullYear(), d.getMonth()+1, 0, 12);
const fmt = d => new Intl.DateTimeFormat("th-TH", { day:"numeric", month:"short", year:"numeric" }).format(d);

function App() {
  const [startDate, setStartDate] = useState("2026-11-07");
  const [days, setDays] = useState([2,6]); // Tue + Sat
  const [people, setPeople] = useState(2);
  const [washPrice, setWashPrice] = useState(30);
  const [dryPrice, setDryPrice] = useState(50);
  const [monthsToShow, setMonthsToShow] = useState(12);
  const [showSettings, setShowSettings] = useState(false);

  const perSession = Number(washPrice || 0) + Number(dryPrice || 0);
  const perPersonSession = people > 0 ? perSession / people : 0;
  const schedule = useMemo(() => {
    const start = parseDate(startDate);
    const end = new Date(start.getFullYear(), start.getMonth()+monthsToShow, 0, 12);
    const dates = [];
    for (let d = new Date(start); d <= end; d = addDays(d,1)) {
      if (days.includes(d.getDay())) dates.push(new Date(d));
    }
    // Always include the selected start date as the first laundry session.
    if (!dates.some(d => iso(d) === iso(start))) dates.unshift(start);
    return dates.sort((a,b) => a-b);
  }, [startDate, days, monthsToShow]);

  const monthRows = useMemo(() => {
    const start = parseDate(startDate);
    return Array.from({length: monthsToShow}, (_,i) => {
      const m = new Date(start.getFullYear(), start.getMonth()+i, 1, 12);
      const from = i === 0 ? start : monthStart(m);
      const to = monthEnd(m);
      const count = schedule.filter(d => d >= from && d <= to).length;
      return { key:`${m.getFullYear()}-${m.getMonth()}`, label:monthName(m), count,
        total:count*perSession, each:count*perPersonSession, from, to };
    });
  }, [schedule, startDate, monthsToShow, perSession, perPersonSession]);

  const nextDates = schedule.slice(0,8);
  const totalSessions = monthRows.reduce((s,m)=>s+m.count,0);
  const totalCost = totalSessions*perSession;
  const toggleDay = day => setDays(old => old.includes(day) ? old.filter(x=>x!==day) : [...old,day].sort((a,b)=>a-b));

  return <main className="page">
    <header className="hero">
      <div className="eyebrow">LAUNDRY BUDGET PLANNER</div>
      <h1>วางแผนค่าซักผ้า <span>หาร 2 คน</span></h1>
      <p>คำนวณค่าใช้จ่ายรายเดือน พร้อมตารางซักและอบล่วงหน้า</p>
      <button className="settingsBtn" onClick={()=>setShowSettings(!showSettings)}><Settings2 size={17}/> ตั้งค่า <ChevronDown size={16}/></button>
    </header>

    {showSettings && <section className="panel settings">
      <h2>ตั้งค่าการซักผ้า</h2>
      <div className="formGrid">
        <label>วันที่เริ่มต้น<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></label>
        <label>จำนวนคน<input type="number" min="1" max="20" value={people} onChange={e=>setPeople(Math.max(1,Number(e.target.value)))}/></label>
        <label>ค่าซักต่อครั้ง (บาท)<input type="number" min="0" value={washPrice} onChange={e=>setWashPrice(e.target.value)}/></label>
        <label>ค่าอบต่อครั้ง (บาท)<input type="number" min="0" value={dryPrice} onChange={e=>setDryPrice(e.target.value)}/></label>
      </div>
      <div className="dayPicker"><strong>เลือกวันซักประจำสัปดาห์</strong><div className="days">
        {THAI_DAYS.map((d,i)=><button key={d} className={days.includes(i)?"day active":"day"} onClick={()=>toggleDay(i)}>{d}</button>)}
      </div><small>ค่าเริ่มต้นคือวันอังคารและวันเสาร์ โดยวันที่เริ่มต้นจะถูกนับเป็นรอบแรกเสมอ</small></div>
      <label className="monthSelect">แสดงล่วงหน้า
        <select value={monthsToShow} onChange={e=>setMonthsToShow(Number(e.target.value))}>
          {[3,6,12,18,24].map(n=><option value={n} key={n}>{n} เดือน</option>)}
        </select>
      </label>
    </section>}

    <section className="stats">
      <article className="stat"><div className="statIcon"><WashingMachine/></div><div><small>ค่าซัก + ค่าอบ / รอบ</small><strong>฿{money(perSession)}</strong><span>฿{money(perPersonSession)} ต่อคน</span></div></article>
      <article className="stat"><div className="statIcon"><Wallet/></div><div><small>ค่าใช้จ่าย / สัปดาห์</small><strong>฿{money(perSession*2)}</strong><span>฿{money(perPersonSession*2)} ต่อคน (2 รอบ)</span></div></article>
      <article className="stat"><div className="statIcon"><Users/></div><div><small>ประมาณการรวม {monthsToShow} เดือน</small><strong>฿{money(totalCost)}</strong><span>฿{money(people ? totalCost/people : 0)} ต่อคน</span></div></article>
    </section>

    <section className="panel">
      <div className="sectionTitle"><div><div className="eyebrow dark">UPCOMING SESSIONS</div><h2>ตารางซักผ้าครั้งถัดไป</h2></div><CalendarDays className="sectionIcon"/></div>
      <div className="upcoming">
        {nextDates.map((d,i)=><div className="session" key={iso(d)}>
          <div className="dateBadge"><b>{d.getDate()}</b><small>{new Intl.DateTimeFormat("th-TH",{month:"short"}).format(d)}</small></div>
          <div className="sessionInfo"><strong>{i===0 && iso(d)===startDate ? "รอบแรก · " : ""}{THAI_DAYS[d.getDay()]}</strong><span>ซัก ฿{money(washPrice)} + อบ ฿{money(dryPrice)}</span></div>
          <b className="sessionCost">฿{money(perSession)}</b>
        </div>)}
      </div>
    </section>

    <section className="panel">
      <div className="sectionTitle"><div><div className="eyebrow dark">MONTHLY FORECAST</div><h2>สรุปค่าใช้จ่ายรายเดือน</h2></div><Wallet className="sectionIcon"/></div>
      <div className="tableWrap"><table><thead><tr><th>เดือน</th><th>จำนวนรอบ</th><th>รวม 2 คน</th><th>ต่อคน</th></tr></thead>
      <tbody>{monthRows.map((m,i)=><tr key={m.key}>
        <td><strong>{m.label}</strong>{i===0 && <small className="sub">เริ่มนับจาก {fmt(parseDate(startDate))}</small>}</td>
        <td>{m.count} รอบ</td><td className="amount">฿{money(m.total)}</td><td className="amount person">฿{money(m.each)}</td>
      </tr>)}</tbody>
      <tfoot><tr><td>รวมทั้งหมด</td><td>{totalSessions} รอบ</td><td>฿{money(totalCost)}</td><td>฿{money(people ? totalCost/people : 0)}</td></tr></tfoot>
      </table></div>
      <p className="note">* เดือนแรกคิดตั้งแต่วันที่เริ่มต้นถึงวันสุดท้ายของเดือน ส่วนเดือนถัดไปคิดเต็มเดือน จำนวนรอบจริงขึ้นอยู่กับวันที่เลือกในปฏิทิน</p>
    </section>

    <section className="tip"><Wind size={20}/><div><strong>วิธีประหยัด</strong><p>รวมผ้าให้เต็มถังในแต่ละรอบ และซักพร้อมอบในวันเดียวกันตามแผน จะช่วยคุมค่าใช้จ่ายให้คงที่ โดยแบ่งค่าใช้จ่ายเท่ากันทุกคน</p></div></section>
    <footer>คำนวณจากราคาที่กรอก · แก้ไขวันและราคาได้ที่เมนูตั้งค่า</footer>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
