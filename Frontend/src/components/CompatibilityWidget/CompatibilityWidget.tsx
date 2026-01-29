import type { FC } from 'react';
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { COMPATIBILITY_DATA } from '@/assistant/compatibilityData';
import './CompatibilityWidget.css';

export const CompatibilityWidget: FC = () => {
  const [selectedId, setSelectedId] = useState<string>(COMPATIBILITY_DATA[0].id);
  const selectedItem = COMPATIBILITY_DATA.find(i => i.id === selectedId);

  return (
    <Card variant="glass">
      <div className="compatibility-chips">
        {COMPATIBILITY_DATA.map((item) => (
          <Button
            key={item.id}
            variant={selectedId === item.id ? 'primary' : 'chip'}
            onClick={() => setSelectedId(item.id)}
          >
            {item.name}
          </Button>
        ))}
      </div>

      {selectedItem && (
        <div className="compatibility-result">
          <div className="compatibility-block compatibility-block--good">
            <h4 className="compatibility-title">💚 Друзья</h4>
            <p className="compatibility-text">
              {selectedItem.friends.join(', ')}
            </p>
          </div>
          <div className="compatibility-block compatibility-block--bad">
            <h4 className="compatibility-title">🛑 Враги</h4>
            <p className="compatibility-text">
              {selectedItem.enemies.join(', ')}
            </p>
          </div>
          <div className="compatibility-tips">
            <span className="compatibility-icon">💡</span>
            <p className="compatibility-text">
              {selectedItem.tips}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
