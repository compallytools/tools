<?php

declare(strict_types=1);

namespace App\Psalm;

use Psalm\Plugin\EventHandler\AfterCodebasePopulatedInterface;
use Psalm\Plugin\EventHandler\Event\AfterCodebasePopulatedEvent;
use Psalm\Plugin\PluginEntryPointInterface;
use Psalm\Plugin\RegistrationInterface;
use Psalm\SymfonyPsalmPlugin\Twig\TemplateFileAnalyzer;
use SimpleXMLElement;
use Symfony\Component\Yaml\Yaml;
use Twig\Loader\FilesystemLoader;

/**
 * Le plugin Symfony de Psalm ne gère qu'un dossier racine de templates. Ce plugin enregistre
 * les namespaces Twig des modules (config/packages/twig.yaml, @Common, @Demo…) sur son loader.
 */
final class TwigModuleNamespacesPlugin implements PluginEntryPointInterface, AfterCodebasePopulatedInterface
{
    public function __invoke(RegistrationInterface $registration, ?SimpleXMLElement $config = null): void
    {
        $registration->registerHooksFromClass(self::class);
    }

    public static function afterCodebasePopulated(AfterCodebasePopulatedEvent $event): void
    {
        $codebase = $event->getCodebase();
        $loader = TemplateFileAnalyzer::getEnvironment($codebase)->getLoader();
        if (!$loader instanceof FilesystemLoader) {
            return;
        }

        $projectDir = rtrim($codebase->config->base_dir, '/');
        /** @var array{twig?: array{paths?: array<string, string>}} $twig */
        $twig = Yaml::parseFile($projectDir . '/config/packages/twig.yaml');

        foreach ($twig['twig']['paths'] ?? [] as $path => $namespace) {
            $dir = str_replace('%kernel.project_dir%', $projectDir, $path);
            if (is_dir($dir)) {
                $loader->addPath($dir, $namespace);
            }
        }
    }
}
