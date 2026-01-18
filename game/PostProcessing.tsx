import { EffectComposer, Bloom, Noise, Vignette, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useControls } from 'leva';

export function GameEffects() {
    const { bloomIntensity, noiseOpacity, vignetteDarkness } = useControls('Post Processing', {
        bloomIntensity: { value: 0.5, min: 0, max: 5 }, // Reduced bloom for gritty feel
        noiseOpacity: { value: 0.25, min: 0, max: 0.5 }, // Increased noise
        vignetteDarkness: { value: 0.7, min: 0, max: 1 },
    });

    return (
        <EffectComposer>
            <Bloom
                luminanceThreshold={0.9}
                mipmapBlur
                intensity={bloomIntensity}
                radius={0.4}
            />
            <Noise opacity={noiseOpacity} blendFunction={BlendFunction.OVERLAY} />
            <Vignette eskil={false} offset={0.1} darkness={vignetteDarkness} />
            <ToneMapping
                adaptive={true}
                resolution={256}
                middleGrey={0.4} // Darker
                maxLuminance={16.0}
                averageLuminance={0.8}
                adaptationRate={1.0}
            />
        </EffectComposer>
    );
}
