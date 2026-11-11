<?php

declare(strict_types=1);

use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Yaml\Yaml;

/**
 * Expose le paramètre "<module>.host" de chaque module déclaré dans config/modules.yaml
 * (les %env()% sont interdits dans le routing). Surcharge possible via <MODULE>_HOST.
 */
return static function (ContainerBuilder $container): void {
    $file = __DIR__ . '/modules.yaml';
    $container->addResource(new FileResource($file));

    /** @var array<string, array{host: string}> $modules */
    $modules = Yaml::parseFile($file);

    $hosts = [];

    foreach ($modules as $module => $config) {
        $envName = strtoupper($module) . '_HOST';
        $override = $_SERVER[$envName] ?? $_ENV[$envName] ?? getenv($envName);
        $host = is_string($override) && '' !== $override ? $override : $config['host'];

        $container->setParameter($module . '.host', $host);
        $hosts[$module] = $host;
    }

    // Tous les hosts, par module (ex. ['contrast_grid' => 'contrast-grid.localhost']).
    $container->setParameter('modules.hosts', $hosts);
};
