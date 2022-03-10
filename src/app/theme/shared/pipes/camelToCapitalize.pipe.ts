import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'cameltocapital'
})
export class CamelToCapitalPipe implements PipeTransform{
    transform(value: string) {
        return value.replace(/([A-Z])/g, ' $1');
    }
}