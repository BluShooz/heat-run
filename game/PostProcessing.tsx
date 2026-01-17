import { EffectComposer, Bloom, Noise, Vignette, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useControls } from 'leva';

export function GameEffects() {
    const { bloomIntensity, noiseOpacity, vignetteDarkness } = useControls('Post Processing', {
        bloomIntensity: { value: 1.5, min: 0, max: 5 },
        noiseOpacity: { value: 0.1, min: 0, max: 0.5 },
        vignetteDarkness: { value: 0.6, min: 0, max: 1 },
    });

    return (
        <EffectComposer>
            <Bloom
                luminanceThreshold={0.8}
                mipmapBlur
                intensity={bloomIntensity}
                radius={0.6}
            />
            <Noise opacity={noiseOpacity} blendFunction={BlendFunction.OVERLAY} />
            <Vignette eskil={false} offset={0.1} darkness={vignetteDarkness} />
            <ToneMapping
                adaptive={true}
                resolution={256}
                middleGrey={0.6}
                maxLuminance={16.0}
                averageLuminance={1.0}
                adaptationRate={1.0}
            />
        </EffectComposer>
    );
}
