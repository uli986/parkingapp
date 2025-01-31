import React from 'react';
import { Calendar, X, CalendarClock, AlertTriangle, Search, Trash2, Clock } from 'lucide-react';

// Types and Constants
interface ParkingSpot {
  id: string;
  name: string;
}

interface Schedule {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

const WS_URL = 'wss://your-server-url.com';
const RECONNECT_DELAY = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

// Parking Spots Data
const PARKING_SPOTS = {
  top: [
    { id: "חניה 2", name: "דורית" },
    { id: "חניה 1", name: "שי" }
  ],
  blocking: [
    { id: "רכב חוסם 1", name: "רכב חוסם 1\nאנא הזן שם פרטי+משפחה ומספר טלפון" },
    { id: "רכב חוסם 2", name: "רכב חוסם 2\nאנא הזן שם פרטי+משפחה ומספר טלפון" },
    { id: "רכב חוסם 3", name: "רכב חוסם 3\nאנא הזן שם פרטי+משפחה ומספר טלפון" },
    { id: "רכב חוסם 4", name: "רכב חוסם 4\nאנא הזן שם פרטי+משפחה ומספר טלפון" },
    { id: "רכב חוסם 5", name: "רכב חוסם 5\nאנא הזן שם פרטי+משפחה ומספר טלפון" }
  ],
  middle: [
    { id: "חניה 5", name: "דבורה" },
    { id: "חניה 4", name: "לאה" },
    { id: "חניה 3", name: "ריבי" }
  ],
  next: [
    { id: "8", name: "דן אלון" },
    { id: "7", name: "מערכות מידע" },
    { id: "חניה 6", name: "נורית" }
  ],
  nextRow: [
    { id: "חניה 10", name: "גיתית" },
    { id: "חניה 11", name: "דב" },
    { id: "חניה 12", name: "מירב" }
  ],
  lastRow: [
    { id: "חניה 15", name: "מאור" },
    { id: "חניה 14", name: "חינית" },
    { id: "חניה 13", name: "יואב" }
  ]
};

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const TimeModal: React.FC<{
  spot: ParkingSpot;
  onClose: () => void;
  hourlySchedule: Schedule;
  selectedDate: Date;
  updateScheduleData: (schedule: Schedule) => void;
}> = ({ spot, onClose, hourlySchedule, selectedDate, updateScheduleData }) => {
  const [editingHour, setEditingHour] = React.useState<number | null>(null);
  const [tempName, setTempName] = React.useState('');
  const [error, setError] = React.useState('');
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [timeFilter, setTimeFilter] = React.useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('all');

  const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
  const spotSchedule = dateSchedule[spot.id] || {};

  const getHoursToShow = React.useMemo(() => 
    Array.from({ length: 13 }, (_, i) => i + 7)
  , []);

  const handleSave = (hour: number, name: string) => {
    if (spot.id.startsWith("רכב חוסם")) {
      const numberMatch = name.match(/\d+/);
      const textWithoutNumbers = name.replace(/\d/g, '').trim();

      if (!numberMatch || numberMatch[0].length < 6) {
        setError('חובה להזין מספר טלפון עם מינימום 6 ספרות');
        return;
      }
      if (textWithoutNumbers.length < 2) {
        setError('חובה להזין שם עם מינימום 2 תווים');
        return;
      }
    }

    const dateKey = formatDateKey(selectedDate);
    const newSchedule = {
      ...hourlySchedule,
      [dateKey]: {
        ...(hourlySchedule[dateKey] || {}),
        [spot.id]: {
          ...(hourlySchedule[dateKey]?.[spot.id] || {}),
          [hour]: name
        }
      }
    };
    updateScheduleData(newSchedule);
    setEditingHour(null);
    setTempName('');
    setError('');
  };

  const handleDelete = (hour: number) => {
    const dateKey = formatDateKey(selectedDate);
    const newSchedule = {
      ...hourlySchedule,
      [dateKey]: {
        ...(hourlySchedule[dateKey] || {}),
        [spot.id]: {
          ...(hourlySchedule[dateKey]?.[spot.id] || {}),
          [hour]: ''
        }
      }
    };
    updateScheduleData(newSchedule);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{spot.id} - {spot.name}</h2>
            <button
              onClick={() => {
                const emptySchedule = getHoursToShow.reduce((acc, hour) => ({
                  ...acc,
                  [hour]: ''
                }), {});
                
                const dateKey = formatDateKey(selectedDate);
                const newSchedule = {
                  ...hourlySchedule,
                  [dateKey]: {
                    ...(hourlySchedule[dateKey] || {}),
                    [spot.id]: emptySchedule
                  }
                };
                updateScheduleData(newSchedule);
              }}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              פנה הכל
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              שמור וחזור
            </button>
            <button 
              onClick={() => {
                const defaultSchedule = getHoursToShow.reduce((acc, hour) => ({
                  ...acc,
                  [hour]: spot.name
                }), {});
                
                const dateKey = formatDateKey(selectedDate);
                const newSchedule = {
                  ...hourlySchedule,
                  [dateKey]: {
                    ...(hourlySchedule[dateKey] || {}),
                    [spot.id]: defaultSchedule
                  }
                };
                updateScheduleData(newSchedule);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              איפוס
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="חיפוש לפי שם..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="all">כל השעות</option>
              <option value="occupied">שעות תפוסות</option>
              <option value="free">שעות פנויות</option>
            </select>

            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="all">כל השעות (7-19)</option>
              <option value="morning">בוקר (7-12)</option>
              <option value="afternoon">צהריים/ערב (13-19)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {getHoursToShow.map(hour => (
            <div 
              key={hour}
              className={`p-2 rounded-lg ${spotSchedule[hour] === '' ? 'bg-green-500' : 'bg-red-500'} text-white 
                        transition-all duration-200 text-sm`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <Clock size={12} />
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(hour)}
                    className="p-1 hover:bg-white/20 rounded cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div 
                  className="p-1 rounded bg-white/10 cursor-pointer min-h-[1.5rem] flex items-center justify-center text-xs"
                  onClick={() => {
                    setEditingHour(hour);
                    setTempName(spotSchedule[hour] || spot.name);
                    setError('');
                  }}
                >
                  {spotSchedule[hour] || spot.name}
                </div>
              </div>
              
              {editingHour === hour && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="הזן שם או מספר טלפון"
                      autoFocus
                    />
                    {error && (
                      <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleSave(hour, tempName)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded"
                      >
                        שמור
                      </button>
                      <button
                        onClick={() => {
                          setEditingHour(null);
                          setTempName('');
                          setError('');
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ParkingManagement: React.FC = () => {
  const [timeModalSpot, setTimeModalSpot] = React.useState<ParkingSpot | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState<boolean>(false);
  const [showSplash, setShowSplash] = React.useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = React.useState<string>('connecting');
  const [hourlySchedule, setHourlySchedule] = React.useState<Schedule>(() => {
    const savedSchedule = localStorage.getItem('parkingSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : {};
  });

  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<number | null>(null);
  const reconnectAttemptsRef = React.useRef<number>(0);

  const connectWebSocket = React.useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        ws.send(JSON.stringify({ 
          type: 'GET_DATA',
          date: formatDateKey(selectedDate)
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SCHEDULE_UPDATE') {
            setHourlySchedule(prevSchedule => {
              const newSchedule = {...prevSchedule, ...data.schedule};
              localStorage.setItem('parkingSchedule', JSON.stringify(
newSchedule));
              return newSchedule;
            });
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
    }
  }, [selectedDate]);

  const updateScheduleData = React.useCallback((newSchedule: Schedule) => {
    setHourlySchedule(prevSchedule => {
      const updatedSchedule = {...prevSchedule, ...newSchedule};
      localStorage.setItem('parkingSchedule', JSON.stringify(updatedSchedule));
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'UPDATE_SCHEDULE',
          schedule: newSchedule
        }));
      }
      
      return updatedSchedule;
    });
  }, []);

  React.useEffect(() => {
    connectWebSocket();
    const timer = setTimeout(() => setShowSplash(false), 2000);

    return () => {
      clearTimeout(timer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);

  const renderSpots = (spots: ParkingSpot[]) => spots.map((spot) => {
    const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
    const spotSchedule = dateSchedule[spot.id] || {};
    const allHoursEmpty = Object.values(spotSchedule).every(value => value === '');
    const hasHours = Object.keys(spotSchedule).length > 0;
    
    return (
      <div
        key={spot.id}
        className={`p-4 ${(hasHours && allHoursEmpty) ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg text-center cursor-pointer hover:opacity-90 transition-colors relative`}
        onClick={() => setTimeModalSpot(spot)}
      >
        <div>{spot.id}</div>
        <div>{spot.name}</div>
      </div>
    );
  });

  const renderBlockingSpot = (spot: ParkingSpot) => {
    const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
    const spotSchedule = dateSchedule[spot.id] || {};
    const allHoursEmpty = Object.values(spotSchedule).every(value => value === '');
    const hasHours = Object.keys(spotSchedule).length > 0;
    
    return (
      <div className="w-full">
        <div
          className={`p-4 ${(hasHours && allHoursEmpty) ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg text-center cursor-pointer hover:opacity-90 transition-colors relative`}
          onClick={() => setTimeModalSpot(spot)}
        >
          <div>{spot.id}</div>
          <div>{spot.name}</div>
        </div>
      </div>
    );
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-green-500 flex items-center justify-center">
        <div className="text-white text-center text-xl font-bold p-4">
          ברוכים הבאים לאפליקציית ניהול החנייה של החברה להגנת הטבע(ע"ר)
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CalendarClock size={20} />
              חזור להיום
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-sm font-medium">תפוס</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm font-medium">פנוי</span>
              </div>
            </div>

            <button 
              onClick={() => setShowDatePicker(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Calendar size={20} />
              שבוע קדימה
            </button>
          </div>

          <div className="text-sm text-gray-500 text-center mt-2">
            {selectedDate.toLocaleDateString('he-IL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDatePicker(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full" dir="rtl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">בחר תאריך</h2>
                <button onClick={() => setShowDatePicker(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i + 1);
                  return (
                    <button
                      key={date.getTime()}
                      onClick={() => {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }}
                      className={`p-4 rounded-lg text-right hover:bg-gray-100`}
                    >
                      {date.toLocaleDateString('he-IL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">{renderSpots(PARKING_SPOTS.top)}</div>
        {renderBlockingSpot(PARKING_SPOTS.blocking[0])}
        <div className="grid grid-cols-3 gap-4">{renderSpots(PARKING_SPOTS.middle)}</div>
        {renderBlockingSpot(PARKING_SPOTS.blocking[1])}
        <div className="grid grid-cols-3 gap-4">{renderSpots(PARKING_SPOTS.next)}</div>
        {renderBlockingSpot(PARKING_SPOTS.blocking[2])}
        <div className="grid grid-cols-3 gap-4">{renderSpots(PARKING_SPOTS.nextRow)}</div>
        {renderBlockingSpot(PARKING_SPOTS.blocking[3])}
        <div className="grid grid-cols-3 gap-4">{renderSpots(PARKING_SPOTS.lastRow)}</div>
        {renderBlockingSpot(PARKING_SPOTS.blocking[4])}
        
        {timeModalSpot && (
          <TimeModal 
            spot={timeModalSpot} 
            onClose={() => setTimeModalSpot(null)}
            hourlySchedule={hourlySchedule}
            selectedDate={selectedDate}
            updateScheduleData={updateScheduleData}
          />
        )}
      </div>
    </div>
  );
};

export default ParkingManagement;
