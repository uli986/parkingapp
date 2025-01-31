import React from 'react';


const ParkingManagement = () => {
  const [timeModalSpot, setTimeModalSpot] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const [hourlySchedule, setHourlySchedule] = React.useState(() => {
    const saved = localStorage.getItem('parkingSchedule');
    return saved ? JSON.parse(saved) : {};
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-green-500 flex items-center justify-center">
        <div className="text-white text-center text-xl font-bold p-4">
          ברוכים הבאים לאפליקציית ניהול החנייה של החברה להגנת הטבע(ע"ר)
        </div>
      </div>
    );
  }

  // נפרמט את התאריך לפורמט שישמש אותנו כמפתח
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // פונקציה לקבלת המידע של תאריך ספציפי

  const resetToToday = () => {
    setSelectedDate(new Date());
  };

  // פונקציה לעדכון לוח הזמנים עם תמיכה בתאריכים
  const updateScheduleWithDate = (spotId, hour, name, date) => {
    const dateKey = formatDateKey(date);
    const newSchedule = {
      ...hourlySchedule,
      [dateKey]: {
        ...(hourlySchedule[dateKey] || {}),
        [spotId]: {
          ...(hourlySchedule[dateKey]?.[spotId] || {}),
          [hour]: name
        }
      }
    };
    setHourlySchedule(newSchedule);
    localStorage.setItem('parkingSchedule', JSON.stringify(newSchedule));
  };

  const DatePickerModal = ({ onClose }) => {
    const getWeekDates = () => {
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i + 1);
        return date;
      });
    };

    const weekDates = getWeekDates();

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full" dir="rtl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">בחר תאריך</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {weekDates.map((date) => {
              const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
              
              return (
                <button
                  key={date.getTime()}
                  onClick={() => {
                    setSelectedDate(date);
                    onClose();
                  }}
                  className={`p-4 rounded-lg text-right ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
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
    );
  };

  const topSpots = [
    { id: "חניה 2", name: "דורית" },
    { id: "חניה 1", name: "שי" }
  ];
  
  const blockingSpot1 = { id: "רכב חוסם 1", name: "רכב חוסם 1\nאנא הזן שם פרטי+משפחה ומספר טלפון" };
  
  const middleSpots = [
    { id: "חניה 5", name: "דבורה" },
    { id: "חניה 4", name: "לאה" },
    { id: "חניה 3", name: "ריבי" }
  ];
  
  const blockingSpot2 = { id: "רכב חוסם 2", name: "רכב חוסם 2\nאנא הזן שם פרטי+משפחה ומספר טלפון" };
  
  const nextSpots = [
    { id: "8", name: "דן אלון" },
    { id: "7", name: "מערכות מידע" },
    { id: "חניה 6", name: "נורית" }
  ];
  
  const blockingSpot3 = { id: "רכב חוסם 3", name: "רכב חוסם 3\nאנא הזן שם פרטי+משפחה ומספר טלפון" };
  
  const nextRowSpots = [
    { id: "חניה 10", name: "גיתית" },
    { id: "חניה 11", name: "דב" },
    { id: "חניה 12", name: "מירב" }
  ];
  
  const blockingSpot4 = { id: "רכב חוסם 4", name: "רכב חוסם 4\nאנא הזן שם פרטי+משפחה ומספר טלפון" };
  
  const lastRowSpots = [
    { id: "חניה 15", name: "מאור" },
    { id: "חניה 14", name: "חינית" },
    { id: "חניה 13", name: "יואב" }
  ];
  
  const blockingSpot5 = { id: "רכב חוסם 5", name: "רכב חוסם 5\nאנא הזן שם פרטי+משפחה ומספר טלפון" };

  const TimeModal = ({ spot, onClose }) => {
    const [editingHour, setEditingHour] = React.useState(null);
    const [tempName, setTempName] = React.useState('');
    const [error, setError] = React.useState('');
    const [localSearchTerm, setLocalSearchTerm] = React.useState('');
    const [timeFilter, setTimeFilter] = React.useState('all');
    const [selectedTimeRange, setSelectedTimeRange] = React.useState('all');
    const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
    const spotSchedule = dateSchedule[spot.id] || {};

    // בפתיחת החלון, נאתחל את כל השעות עם השם של בעל החניה אם הן ריקות
    React.useEffect(() => {
      const hours = getHoursToShow();
      const dateKey = formatDateKey(selectedDate);
      let needsUpdate = false;
      
      // נבדוק אם יש שעות שלא מאותחלות
      for (const hour of hours) {
        if (spotSchedule[hour] === undefined) {
          needsUpdate = true;
          break;
        }
      }

      // אם יש שעות לא מאותחלות, נאתחל אותן
      if (needsUpdate) {
        const newSchedule = {
          ...hourlySchedule,
          [dateKey]: {
            ...(hourlySchedule[dateKey] || {}),
            [spot.id]: {
              ...spotSchedule,
              ...hours.reduce((acc, hour) => ({
                ...acc,
                [hour]: spotSchedule[hour] === undefined ? spot.name : spotSchedule[hour]
              }), {})
            }
          }
        };
        setHourlySchedule(newSchedule);
        localStorage.setItem('parkingSchedule', JSON.stringify(newSchedule));
      }
    }, [spot.id]);
  
      // אתחול המשבצות עם השם של בעל החניה
      const initialSchedule = {};
      for (let i = 7; i <= 19; i++) {
        // אם יש ערך קיים נשתמש בו, אחרת נשים את השם מהמשבצת הראשית
        initialSchedule[i] = spotSchedule[i] === undefined ? spot.name : spotSchedule[i];
      }
      return initialSchedule;
    });

 

    const timeRanges = {
      morning: Array.from({ length: 6 }, (_, i) => i + 7),      // 7-12
      afternoon: Array.from({ length: 7 }, (_, i) => i + 13),   // 13-19
    };

    const getHoursToShow = () => {
      // מערך של כל השעות האפשריות (7-19)
      let hours = Array.from({ length: 13 }, (_, i) => i + 7);
      
      if (selectedTimeRange !== 'all') {
        hours = timeRanges[selectedTimeRange];
      }

      if (timeFilter !== 'all') {
        hours = hours.filter(hour => {
          const isOccupied = Boolean(spotSchedule[hour]);
          return timeFilter === 'occupied' ? isOccupied : !isOccupied;
        });
      }

      if (localSearchTerm) {
        hours = hours.filter(hour => 
          spotSchedule[hour]?.toLowerCase().includes(localSearchTerm.toLowerCase())
        );
      }

      return hours;
    };

    const handleDelete = (hour) => {
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
      setHourlySchedule(newSchedule);
      localStorage.setItem('parkingSchedule', JSON.stringify(newSchedule));
    };

    const updateSchedule = (spotId, hour, name) => {
      updateScheduleWithDate(spotId, hour, name, selectedDate);
    };

    const handleSave = (hour) => {
      // בדיקה אם זה רכב חוסם (1-5)
      if (spot.id.startsWith("רכב חוסם")) {
        // בדיקת מספר טלפון
        const numberMatch = tempName.match(/\d+/);
        if (!numberMatch || numberMatch[0].length < 6) {
          setError('חובה להזין מספר טלפון עם מינימום 6 ספרות');
          return;
        }

        // בדיקת שם
        const textWithoutNumbers = tempName.replace(/\d/g, '').trim();
        if (textWithoutNumbers.length < 2) {
          setError('חובה להזין שם עם מינימום 2 תווים');
          return;
        }
      } else {
        // לוגיקה רגילה עבור שאר המשבצות
        if (tempName) {
          const isNumber = /^\d+$/.test(tempName);
          if (isNumber) {
            if (tempName.length < 6) {
              setError('מספר טלפון חייב להכיל לפחות 6 ספרות');
              return;
            }
          } else {
            if (tempName.length < 2) {
              setError('מינימום 2 תווים');
              return;
            }
          }
        }
      }
      
      updateSchedule(spot.id, hour, tempName);
      setEditingHour(null);
      setTempName('');
      setError('');
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
           onClick={(e) => {
             if (e.target === e.currentTarget) {
               onClose();
             }
           }}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 border-b">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">{spot.id} - {spot.name}</h2>
              <button
                onClick={() => {
                  const hours = getHoursToShow();
                  const dateKey = formatDateKey(selectedDate);
                  const emptySchedule = {};
                  hours.forEach(hour => {
                    emptySchedule[hour] = '';
                  });
                  
                  const newSchedule = {
                    ...hourlySchedule,
                    [dateKey]: {
                      ...(hourlySchedule[dateKey] || {}),
                      [spot.id]: emptySchedule
                    }
                  };
                  setHourlySchedule(newSchedule);
                  localStorage.setItem('parkingSchedule', JSON.stringify(newSchedule));
                }}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                פנה הכל
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.setItem('parkingSchedule', JSON.stringify(hourlySchedule));
                  onClose();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                שמור וחזור
              </button>
              <button 
                onClick={() => {
                  const hours = getHoursToShow();
                  const dateKey = formatDateKey(selectedDate);
                  const defaultSchedule = {};
                  hours.forEach(hour => {
                    defaultSchedule[hour] = spot.name;
                  });
                  
                  const newSchedule = {
                    ...hourlySchedule,
                    [dateKey]: {
                      ...(hourlySchedule[dateKey] || {}),
                      [spot.id]: defaultSchedule
                    }
                  };
                  setHourlySchedule(newSchedule);
                  localStorage.setItem('parkingSchedule', JSON.stringify(newSchedule));
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

          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {getHoursToShow().map(hour => (
              <div 
                key={hour}
                className={`p-2 rounded-lg ${spotSchedule[hour] ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} 
                           transition-all duration-200 text-sm`}
              >
                {editingHour === hour ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="px-2 py-1 text-black rounded border w-full text-sm"
                      placeholder={spot.name}
                      autoFocus
                      dir="auto"
                    />
                    {error && (
                      <div className="text-red-200 text-xs flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {error}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1">
                      <button 
                        onClick={() => handleSave(hour)}
                        className="flex-1 bg-white text-green-500 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      >
                        שמור
                      </button>
                      <button 
                        onClick={() => {
                          setEditingHour(null);
                          setTempName('');
                          setError('');
                        }}
                        className="flex-1 bg-white text-gray-500 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-bold flex items-center gap-1 text-xs">
                        <Clock size={12} />
                        {String(hour).padStart(2, '0')}:00
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(hour);
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <Trash2 size={12} />
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
                      {spotSchedule[hour] || 'לחץ להוספה'}
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

  
    const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
    const spotSchedule = dateSchedule[spot.id] || {};
    return Object.values(spotSchedule).every(value => !value);


  const renderSpots = (spots) => (
    spots.map((spot) => {
      const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
      const spotSchedule = dateSchedule[spot.id] || {};
      const allHoursEmpty = Object.values(spotSchedule).every(value => value === '');
      const hasHours = Object.keys(spotSchedule).length > 0;
      const hasEmptyHour = Object.values(spotSchedule).some(value => value === '');
      
      return (
        <div
          key={spot.id}
          className={`p-4 ${(hasHours && allHoursEmpty) ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg text-center cursor-pointer hover:opacity-90 transition-colors relative`}
          onClick={() => setTimeModalSpot(spot)}
        >
          <div>{spot.id}</div>
          <div>{spot.name}</div>
          {hasHours && hasEmptyHour && !allHoursEmpty && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full" />
          )}
        </div>
      );
    })
  );

  const renderBlockingSpot = (spot) => {
    const dateSchedule = hourlySchedule[formatDateKey(selectedDate)] || {};
    const spotSchedule = dateSchedule[spot.id] || {};
    const allHoursEmpty = Object.values(spotSchedule).every(value => value === '');
    const hasHours = Object.keys(spotSchedule).length > 0;
    const hasEmptyHour = Object.values(spotSchedule).some(value => value === '');
    
    return (
      <div className="w-full">
        <div
          className={`p-4 ${(hasHours && allHoursEmpty) ? 'bg-green-500' : 'bg-red-500'} text-white rounded-lg text-center cursor-pointer hover:opacity-90 transition-colors relative`}
          onClick={() => setTimeModalSpot(spot)}
        >
          <div>{spot.id}</div>
          <div>{spot.name}</div>
          {hasHours && hasEmptyHour && !allHoursEmpty && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full" />
          )}
        </div>
      </div>
    );
  };

  return (
   <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
  {/hello/}
</div>
<div className="flex flex-col gap-4 max-w-lg mx-auto">
  {/hello /}
</div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <button 
                onClick={resetToToday}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CalendarClock size={20} />
                חזור להיום
              </button>

              <button 
                onClick={() => setShowDatePicker(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Calendar size={20} />
                שבוע קדימה
              </button>
            </div>
            
            <div className="flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-sm font-medium">תפוס</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm font-medium">פנוי</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              {selectedDate.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        {showDatePicker && (
          <DatePickerModal onClose={() => setShowDatePicker(false)} />
        )}
        {timeModalSpot && (
          <TimeModal
            spot={timeModalSpot}
            onClose={() => setTimeModalSpot(null)}
          />
       return (
  <div>
    <div>
      {/* Other code */}
    </div>

    {showDatePicker && (
      <DatePickerModal onClose={() => setShowDatePicker(false)} />
    )}

    {timeModalSpot && (
      <TimeModal
        spot={timeModalSpot}
        onClose={() => setTimeModalSpot(null)}
      />
    )}

    <div className="grid grid-cols-2 gap-4">{renderSpots(topSpots)}</div>
    {renderBlockingSpot(blockingSpot1)}
    <div className="grid grid-cols-3 gap-4">{renderSpots(middleSpots)}</div>
    {renderBlockingSpot(blockingSpot2)}
    <div className="grid grid-cols-3 gap-4">{renderSpots(nextSpots)}</div>
    {renderBlockingSpot(blockingSpot3)}
    <div className="grid grid-cols-3 gap-4">{renderSpots(nextRowSpots)}</div>
    {renderBlockingSpot(blockingSpot4)}
    <div className="grid grid-cols-3 gap-4">{renderSpots(lastRowSpots)}</div>
    {renderBlockingSpot(blockingSpot5)}
  </div>
);
