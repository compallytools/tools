<?php

declare(strict_types=1);

namespace App\Common\ApiPlatform;

use ApiPlatform\Metadata\Operations;
use ApiPlatform\Metadata\Resource\Factory\ResourceMetadataCollectionFactoryInterface;
use ApiPlatform\Metadata\Resource\ResourceMetadataCollection;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Applique implicitement le host du module (config/modules.yaml) aux opérations des ressources
 * dont la classe est dans App\<Module>\. Un host explicite sur l'opération est conservé.
 */
#[AsDecorator(decorates: 'api_platform.metadata.resource.metadata_collection_factory')]
final class ModuleHostResourceMetadataCollectionFactory implements ResourceMetadataCollectionFactoryInterface
{
    /**
     * @param array<string, string> $moduleHosts host par module (snake_case)
     */
    public function __construct(
        private readonly ResourceMetadataCollectionFactoryInterface $decorated,
        #[Autowire(param: 'modules.hosts')]
        private readonly array $moduleHosts,
    ) {
    }

    public function create(string $resourceClass): ResourceMetadataCollection
    {
        $collection = $this->decorated->create($resourceClass);

        $host = $this->hostFor($resourceClass);
        if (null === $host) {
            return $collection;
        }

        foreach ($collection as $i => $resource) {
            $operations = new Operations();
            foreach ($resource->getOperations() ?? [] as $name => $operation) {
                if (null === $operation->getHost()) {
                    $operation = $operation->withHost($host);
                }
                $operations->add($name, $operation);
            }
            $collection[$i] = $resource->withOperations($operations);
        }

        return $collection;
    }

    private function hostFor(string $resourceClass): ?string
    {
        if (1 !== preg_match('/^App\\\\([^\\\\]+)\\\\/', $resourceClass, $m)) {
            return null;
        }

        $module = strtolower((string) preg_replace('/(?<!^)[A-Z]/', '_$0', $m[1]));

        return $this->moduleHosts[$module] ?? null;
    }
}
