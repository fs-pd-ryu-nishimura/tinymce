import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option, Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { SugarEvent } from '../../alien/TypeDefinitions';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as PartType from '../../parts/PartType';
import { SliderDetail } from '../../ui/types/SliderTypes';
import * as SliderActions from './SliderActions';

const platform = PlatformDetection.detect();
const isTouch = platform.deviceType.isTouch();

const edgePart = (name: string, action: (comp: AlloyComponent, d: SliderDetail) => void) => {
  return PartType.optional({
    name: '' + name + '-edge',
    overrides (detail: SliderDetail) {
      const touchEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.touchstart(), action, [ detail ])
      ]);

      const mouseEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.mousedown(), action, [ detail ]),
        AlloyEvents.runActionExtra(NativeEvents.mousemove(), (l, det) => {
          if (det.mouseIsDown().get()) { action (l, det); }
        }, [ detail ])
      ]);

      return {
        events: isTouch ? touchEvents : mouseEvents
      };
    }
  });
};

// When the user touches the top left edge, it should move the thumb
const tlEdgePart = edgePart('top-left', SliderActions.setToTLedge);

// When the user touches the top edge, it should move the thumb
const tedgePart = edgePart('top', SliderActions.setToTedge);

// When the user touches the top right edge, it should move the thumb
const trEdgePart = edgePart('top-right', SliderActions.setToTRedge);

// When the user touches the right edge, it should move the thumb
const redgePart = edgePart('right', SliderActions.setToRedge);

// When the user touches the bottom right edge, it should move the thumb
const brEdgePart = edgePart('bottom-right', SliderActions.setToBRedge);

// When the user touches the bottom edge, it should move the thumb
const bedgePart = edgePart('bottom', SliderActions.setToBedge);

// When the user touches the bottom left edge, it should move the thumb
const blEdgePart = edgePart('bottom-left', SliderActions.setToBLedge);

// When the user touches the left edge, it should move the thumb
const ledgePart = edgePart('left', SliderActions.setToLedge);

// The thumb part needs to have position absolute to be positioned correctly
const thumbPart = PartType.required({
  name: 'thumb',
  defaults: Fun.constant({
    dom: {
      styles: { position: 'absolute' }
    }
  }),
  overrides (detail: SliderDetail) {
    return {
      events: AlloyEvents.derive([
        // If the user touches the thumb itself, pretend they touched the spectrum instead. This
        // allows sliding even when they touchstart the current value
        AlloyEvents.redirectToPart(NativeEvents.touchstart(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchmove(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchend(), detail, 'spectrum'),

        AlloyEvents.redirectToPart(NativeEvents.mousedown(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.mousemove(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.mouseup(), detail, 'spectrum')
      ])
    };
  }
});

const spectrumPart = PartType.required({
  schema: [
    FieldSchema.state('mouseIsDown', () => Cell(false))
  ],
  name: 'spectrum',
  overrides (detail: SliderDetail) {
    const modelDetail = detail['morgan-model']();
    const model = modelDetail.manager();

    const setValueTo = (component, simulatedEvent) => {
      return model.getValueFromEvent(simulatedEvent).map(function (value) {
        return model.setValueTo(component, detail, value);
      });
    } ;

    const touchEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.touchstart(), setValueTo),
      AlloyEvents.run(NativeEvents.touchmove(), setValueTo)
    ]);

    const mouseEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.mousedown(), setValueTo),
      AlloyEvents.run<SugarEvent>(NativeEvents.mousemove(), (spectrum, se) => {
        if (detail.mouseIsDown().get()) { setValueTo(spectrum, se); }
      })
    ]);

    return {
      behaviours: Behaviour.derive(isTouch ? [ ] : [
        // Move left and right along the spectrum
        Keying.config(
          {
            mode: 'special',
            onLeft: (spectrum) => {
              return model.onLeft(spectrum, detail);
            },
            onRight: (spectrum) => {
              return model.onRight(spectrum, detail);
            },
            onUp: (spectrum) => {
              return model.onUp(spectrum, detail);
            },
            onDown: (spectrum) => {
              return model.onDown(spectrum, detail);
            }
          }
        ),
        Focusing.config({ })
      ]),

      events: isTouch ? touchEvents : mouseEvents
    };
  }
});

export default [
  ledgePart,
  redgePart,
  tedgePart,
  bedgePart,
  tlEdgePart,
  trEdgePart,
  blEdgePart,
  brEdgePart,
  thumbPart,
  spectrumPart
] as PartType.PartTypeAdt[];